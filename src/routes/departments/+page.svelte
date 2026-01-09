<script lang="ts">
	import AddItemModal from './addItemModal.svelte'
	import DeleteItemModal from './deleteItemModal.svelte'
	import EditItemModal from './editItemModal.svelte'
	import type { Department, Item } from '$lib/server/db/schema'
    import type { User } from '$lib/utils';

    // Types

    
    //Props
    let { data, form } = $props<{
        data: {
            user: User,
            departments: Department[],
            currentrole: string | null;
        };
        form?: FormData;
    }>();
    const { user, departments, currentrole} = data
    
    
    // State
    let currentSelectedList = $state<Department | Object>({})
    let addIsOpen = $state(false)
    let deleteIsOpen = $state(false)
    let editIsOpen = $state(false)
    let selecteditems = $derived(changeSelectedItem2());
    
    function changeSelectedItem2() {
        const totalTtemsCount: [number, string][] = $state([])
        departments.forEach((department: Department) => {
            totalTtemsCount.push([
                department.id, 
                department.departmentname ?? ""])
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
    
    function openEditModal(department: Department) {
        currentSelectedList = department
        editIsOpen = true
    }
    
    function openDeleteModal(department: Department) {
        currentSelectedList = department
        deleteIsOpen = true;
    }
    
    console.log(selecteditems)
        
</script>

<AddItemModal bind:addIsOpen {form} {user}/>
<DeleteItemModal bind:deleteIsOpen {form} {currentSelectedList} {user}/>
<EditItemModal bind:editIsOpen {currentSelectedList} {form} {user}/>

<div class="mx-auto max-h-[80vh] w-[90%] mt-3">
    <div class="flex max-sm:block">
    
        <button onmousedown="{() => {
        addIsOpen = !addIsOpen
        }}" class="mb-3 max-sm:w-full"
        >+ Add New Department</button>

            
    </div>
    
    <div class="overflow-y-auto max-h-[70vh] mb-3 max-sm:w-full">
    <table>
        <thead>
            <tr>
                <th>Department</th>
                <th></th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each selecteditems as row}
            <tr class="hover">
                <td><h2 class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{row[1]}</h2></td>
                <td class="p-0">
                    {#if (currentrole == "1")}
                        <button onmousedown="{() => {openEditModal({id: row[0], departmentname: row[1]})}}">✏️</button>
                    {/if}
                </td>
                <td class="p-0">
                    {#if (currentrole == "1")}
                        <button onmousedown="{() => {openDeleteModal({id: row[0], departmentname: row[1]})}}">❌</button>
                    {/if}
                </td>
            </tr>
            {/each}
        </tbody>
    </table>
    </div>
</div>