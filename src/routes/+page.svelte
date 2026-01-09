<script lang="ts">
	import { department } from '$lib/shared.svelte';
	import type { PageServerData } from './$types';
	import SignInModal from './signInModal.svelte';
	import SignOutModal from './signOutModal.svelte';
	const DEBUG = false


	function debugPrint(x: string, y: unknown) {
		console.log(x + ": \n---------------------")
		console.log(y)
		console.log("--------END---------")
	}

	let { form, data }: { 
		form?: FormData; 
		data: PageServerData 
	} = $props()

    let items = $derived(changeSelectedItem2(data.items, department.current.value))

	if (DEBUG) {
		debugPrint("data.items", data.items)
		debugPrint("data.inventoryList", data.inventoryList)
		debugPrint("data.departmentList", data.departmentList)
	}

	function changeSelectedItem2(items_, selecteddept_: number) {
        let selectedusers_ = []
        items_.forEach(row => {
            if (row.issuerdept == selecteddept_) {
                selectedusers_.push(row)
        }})
		return selectedusers_
	}


	$effect(() => {
        if (!form) return;

        if (form.error) {
            switch (form.action) {
                case 'signout':
                    signOutModalOpen = true;
                    break;
                case 'signin':
                    signInModalOpen = true;
                    break;
            }
        } else if (form.success) {
            closeAllModals();
        }
    })

	function closeAllModals() {
		signOutModalOpen = false
		signInModalOpen = false
    }

    let signOutModalOpen = $state(false)
    let signInModalOpen = $state(false)
</script>
   
<SignOutModal bind:signOutModalOpen {data} {form}/>
<SignInModal bind:signInModalOpen {data} {form}/>


<div class="mx-auto max-h-[50vh] w-[90%] mt-3">
	<button
		onmousedown="{() => {
		signOutModalOpen = true
	}}" class="mb-3 max-sm:w-full"
	>Sign Classifieds Out / HOTO</button>

	<button 
		onmousedown="{() => {
		signInModalOpen = true
	}}" class="mb-3 max-sm:w-full"
	>Sign Classfieds In </button>
	<div class="overflow-y-auto mb-3 max-sm:w-full">
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Issuer</th>
				<th>Issuee</th>
				<th>		
				</th>
			</tr>
		</thead>
		<tbody>
			{#each items as row}
			<tr>
				<td><h2>{row.itemname}</h2></td>
				<td><h2>{row.issuer}</h2></td>
				<td><h2>{row.issuee}</h2></td>
				<td></td>
			</tr>
			{/each}
		</tbody>
	</table>
	</div>
</div>
