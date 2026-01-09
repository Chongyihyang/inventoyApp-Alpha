<script lang="ts">
	import AddItemModal from './addItemModal.svelte'
	import BarcodeModal from './barcodeModal.svelte';
	import DeleteItemModal from './deleteItemModal.svelte'
	import EditItemModal from './editItemModal.svelte'
	import ImportItemModal from './importItemModal.svelte';
    import { department } from "$lib/shared.svelte"
    import type { Categories, Item } from '$lib/server/db/schema'
    import type { User } from '$lib/utils';
    
    // Types

    type Results = {
            totalItems: number,
            successCount: number,
            errorCount: number,
            successfulItems: Array<Object>,
                failedItems: Array<string>,
                    details: Array<string>
                    };
                    
                    type Department = {
                        id: string;
                        departmentname: string;
                    };
                    
                    type FormData = {
                        error?: string;
                        action?: 'edit' | 'add' | 'delete';
                        success?: boolean;
    };
    
    
    //Props
    let { data, form } = $props<{
        data: {
            user: User,
            departments: Department[],
            items: Item[],
            currentdept: number | null,
            currentrole: string | null,
            categories: Categories[],
        },
        form?: FormData,
    }>();
    const { user, departments, items, currentdept, currentrole, categories } = data
    
    
    // State
    let isUploading = $state(false);
    let fileInput: HTMLFormElement;
    let currentSelectedList = $state<Item | Object>({})
    let addIsOpen = $state(false)
    let deleteIsOpen = $state(false)
    let editIsOpen = $state(false)
    let importIsOpen = $state(false)
    let barcodeIsOpen = $state(false)
    let searchQuery = $state("")
    let selecteddept = $derived(department.current.value)
    let filteredItems = $derived(filterItems(items, searchQuery, selecteddept));
    let selecteditems: Item[] = $derived(changeSelectedItem2(filteredItems, selecteddept));
    let importResults = $state<Results>({
        totalItems: 0,
        successCount: 0,
        errorCount: 0,
        successfulItems: [{
            itemid: 0
        },{
            itemid:1
        },{
            itemid:2
        },{
            itemid:3
        },{
            itemid:4
        }],
        failedItems: [],
        details: []
    })

    function changeSelectedItem2(items_: Item[], selecteddept_: number) {
        let selecteditems_: Item[] = []
        items_.forEach((row: Item) => {
            if (row.currentholder == selecteddept_) {
                selecteditems_.push(row)
            }})
        return selecteditems_
    }
    
    function filterItems(items: Item[], query: string, selecteddept: number): Item[] {
        if (!query.trim()) {
            return items;
        }
        
        const lowercaseQuery = query.toLowerCase().trim();
        return items.filter((item: Item) => {
            return (
                item.itemname?.toLowerCase().includes(lowercaseQuery) ||
                item.SN1?.toLowerCase().includes(lowercaseQuery) ||
                item.SN2?.toLowerCase().includes(lowercaseQuery)
            );
        });
    }
    
        
    // Handle form state changes
    $effect(() => {

        if (!form) return;
        
        if (form.error) {
            switch (form.action) {
                case 'edit':
                    editIsOpen = true;
                    currentSelectedList = form.updateData;
                    break;
                case 'add':
                    addIsOpen = true;
                    break;
                case 'delete':
                    deleteIsOpen = true;
                    currentSelectedList = {};
                    break;
            }
        } else if (form.results){
            importIsOpen = true
            importResults = form.results
            form.results = false
        } else if (form.success) {
            closeAllModals();
        }

    });
    
    function closeAllModals() {
        addIsOpen = false;
        editIsOpen = false;
        deleteIsOpen = false;
    }
    
    function openEditModal(item: Item) {
        currentSelectedList = item;
        editIsOpen = true;
    }
    
    function openDeleteModal(item: Item) {
        currentSelectedList = item;
        deleteIsOpen = true;
    }

    
        
</script>

<AddItemModal bind:addIsOpen {form} {departments} {user} {categories}/>
<DeleteItemModal bind:deleteIsOpen {form} {currentSelectedList} {user}/>
<EditItemModal bind:editIsOpen {currentSelectedList} {form} {user} {categories}/>
<ImportItemModal bind:importIsOpen {form} {importResults}/>
<BarcodeModal bind:barcodeIsOpen {selecteditems}/>

<div class="mx-auto max-h-[80vh] w-[90%] mt-3">
    <div class="flex max-sm:block">
        <button onmousedown="{() => {
            barcodeIsOpen = true
        }}" class="mb-3 max-sm:w-full" 
        >Print Barcodes</button>
    
        <button onmousedown="{() => {
        addIsOpen = !addIsOpen
        }}" class="mb-3 max-sm:w-full"
        >+ Add New Item</button>
            
        <form 
        method="POST" 
        action="?/upload" 
        enctype="multipart/form-data"
        bind:this={fileInput}
        onsubmit={() => isUploading = true}>
        <button type="button" class="mb-3 max-sm:w-full">
			<input type="hidden" name="id_" value={user.id}>
			<input type="hidden" name="username" value={user.username}>
            <input
              type="file"
              name="file"
              onchange={() => {
                // Auto-submit when file changes
                if (isUploading) return;
                fileInput.submit()
                isUploading = false
              }}
              class="hidden"
              id="file-upload"
              required
              disabled={isUploading}
            />
            <label for="file-upload" class="upload-button">
              {#if isUploading}
                Uploading...
              {:else}
              + Import New Items
              {/if}
            </label>
        </button>
        
      </form>
    </div>
    
    <div class="overflow-y-auto max-h-[70vh] mb-3 max-sm:w-full max-sm:max-h-[50vh]">
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th class="max-sm:hidden">SN1</th>
                <th class="max-sm:hidden">SN2</th>
                <th class="max-sm:hidden">Original Holder</th>
                <th colspan="2" class="px-1">
                    <div class="flex flex-col gap-1">
                        <div class="flex gap-2">
                            <input 
                                class="flex-1 rounded-2xl dark:bg-gray-800 h-8 text-[15px] w-25 mr-3" 
                                type="text" 
                                placeholder="Search by name, SN1, or SN2"
                                bind:value={searchQuery}
                            >
                            <!-- {#if searchQuery.trim()}
                                <button 
                                    type="button"
                                    class="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                    onmousedown={() => searchQuery = ""}
                                >
                                    Clear
                                </button>
                            {/if} -->
                        </div>
                        <!-- {#if searchQuery.trim()}
                            <div class="text-xs text-gray-600 dark:text-gray-400">
                                Found {selecteditems.length} of {filteredItems.length} items matching "{searchQuery}"
                            </div>
                        {/if} -->
                    </div>
                </th>
            </tr>
        </thead>
        <tbody>
            {#if selecteditems.length === 0}
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500 dark:text-gray-400">
                        {#if searchQuery.trim()}
                            No items found matching "{searchQuery}"
                        {:else}
                            No items found in this department
                        {/if}
                    </td>
                </tr>
            {:else}
                {#each selecteditems as row}
                {#if row.us}
                    <tr class="hover text-red-600">
                        <td><h2 class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{row.itemname}</h2></td>
                        <td class="max-sm:hidden"><h2>{row.SN1}</h2></td>
                        <td class="max-sm:hidden"><h2>{row.SN2}</h2></td>
                        <td class="max-sm:hidden"><h2>{row.originalholder}</h2></td>
                        <td class="p-0">
                            {#if (currentrole == "1") || (currentrole == "2" && currentdept == selecteddept)}
                                <button onmousedown="{() => {openEditModal(row)}}">✏️</button>
                            {/if}
                        </td>
                        <td class="p-0">
                            {#if (currentrole == "1") || (currentrole == "2" && currentdept == selecteddept)}
                                <button  onmousedown="{() => {openDeleteModal(row)}}">❌</button>
                            {/if}
                        </td>
                    </tr>
                {:else}
                    <tr class="hover">
                        <td><h2 class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{row.itemname}</h2></td>
                        <td class="max-sm:hidden"><h2>{row.SN1}</h2></td>
                        <td class="max-sm:hidden"><h2>{row.SN2}</h2></td>
                        <td class="max-sm:hidden"><h2>{row.originalholder}</h2></td>
                        <td class="p-0">
                            {#if (currentrole == "1") || (currentrole == "2" && currentdept == selecteddept)}
                                <button onmousedown="{() => {openEditModal(row)}}">✏️</button>
                            {/if}
                        </td>
                        <td class="p-0">
                            {#if (currentrole == "1") || (currentrole == "2" && currentdept == selecteddept)}
                                <button  onmousedown="{() => {openDeleteModal(row)}}">❌</button>
                            {/if}
                        </td>
                    </tr>
                {/if}
                {/each}
            {/if}
        </tbody>
    </table>
    </div>
</div>