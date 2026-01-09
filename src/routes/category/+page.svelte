<script lang="ts">
	import AddItemModal from './addItemModal.svelte'
	import DeleteItemModal from './deleteItemModal.svelte'
	import EditItemModal from './editItemModal.svelte'
	import type { Categories, Item } from '$lib/server/db/schema'
    import type { User } from '$lib/utils';
    import { department } from "$lib/shared.svelte"

    // Types

    
    //Props
    let { data, form } = $props<{
        data: {
            user: User,
            categories: Categories[],
            currentrole: string | null;
            items: Item[]
        };
        form?: FormData;
    }>();
    const { user, categories, currentrole, items } = data
    
    
    // State
    let currentSelectedList = $state<Categories | Object>({})
    let addIsOpen = $state(false)
    let deleteIsOpen = $state(false)
    let editIsOpen = $state(false)
    let selecteddept = $derived(department.current.value)
    let selecteditems = $derived(changeSelectedItem2(items, selecteddept));
    
    function changeSelectedItem2(items_: Item[], selecteddept_: number) {
        const totalTtemsCount: [number, string, number, number][] = $state([])
        categories.forEach((category: Categories) => {
            totalTtemsCount.push([category.id, category.categoryname, items_.filter(x => x.category == category.id && x.us == 0 && x.currentholder == selecteddept_).length, items_.filter(x => x.category == category.id && x.currentholder == selecteddept_).length])
        })
        return totalTtemsCount
    }

    // Handle form state changes
    $effect(() => {
        
        if (!form) return;
        
        if (form.error) {
            switch (form.action) {
                case 'edit':
                    editIsOpen = true
                    currentSelectedList = {"categoryname": form.updateData}
                    break;
                case 'add':
                    addIsOpen = true;
                    break;
                case 'delete':
                    deleteIsOpen = true;
                    currentSelectedList = {};
                    break;
            }
        } else if (form.success) {
            closeAllModals();
        }
    });
    
    function closeAllModals() {
        addIsOpen = false;
        editIsOpen = false;
        deleteIsOpen = false;
    }
    
    function openEditModal(category: Categories) {
        currentSelectedList = category
        editIsOpen = true
    }
    
    function openDeleteModal(category: Categories) {
        currentSelectedList = category
        deleteIsOpen = true;
    }
    
        
</script>

<AddItemModal bind:addIsOpen {form} {user}/>
<DeleteItemModal bind:deleteIsOpen {form} {currentSelectedList} {user}/>
<EditItemModal bind:editIsOpen {currentSelectedList} {form} {user}/>

<div class="mx-auto max-h-[80vh] w-[90%] mt-3">
    <div class="flex max-sm:block">
    
        <button onmousedown="{() => {
        addIsOpen = !addIsOpen
        }}" class="mb-3 max-sm:w-full"
        >+ Add New Item</button>

            
    </div>
    
    <div class="overflow-y-auto max-h-[70vh] mb-3 max-sm:w-full">
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Servicability State</th>
                <th></th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each selecteditems as row}
            {#if (row[3] != 0)}
                <tr class="hover">
                    <td><h2 class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{row[1]}</h2></td>
                    <td><h2 class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{row[2]} / {row[3]}</h2></td>
                    <td class="p-0">
                        {#if (currentrole == "1")}
                            <button onmousedown="{() => {openEditModal({id: row[0], categoryname: row[1]})}}">✏️</button>
                        {/if}
                    </td>
                    <td class="p-0">
                        {#if (currentrole == "1")}
                            <button onmousedown="{() => {openDeleteModal({id: row[0], categoryname: row[1]})}}">❌</button>
                        {/if}
                    </td>
                </tr>
            {/if}
            {/each}
        </tbody>
    </table>
    </div>
</div>