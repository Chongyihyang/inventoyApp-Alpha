<script lang="ts">
	import type { Categories } from "$lib/server/db/schema"
	import type { User } from "$lib/utils"

	// init types
	type Item = {
		id: string;
		itemname: string;
		[key: string]: unknown; // For other potential properties
	};

    type FormData = {
        error?: string
    }

	// Props with type annotations
	let { 
		editIsOpen = $bindable<boolean>(),
		form = $bindable<FormData>(),
		currentSelectedList = $bindable<Item[]>(),
		user = $bindable<User>(),
		categories = $bindable<Categories>(),
    } = $props()
    let dialog = $state<HTMLDialogElement>()
	// svelte-ignore non_reactive_update
	let error:HTMLParagraphElement

	$effect(() => {
		if (!dialog) return;

		if (editIsOpen) {
			dialog.showModal();
		} else if (editIsOpen == false){
			dialog.close()

		}
	})


	function closeModal() {
		editIsOpen = false
		if (error != null) {
			error.innerHTML = ""
		}
	}
</script>


<dialog
bind:this={dialog}
onclose={() => (editIsOpen = false)}
onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>
	<div class="internal">
		<h2 class="title">Edit properties for {currentSelectedList.itemname}</h2>
		{#if form?.error && form?.action === 'edit'}
			<p id="error" bind:this={error} >{form.error}</p>
		{/if}
		<form method="POST" action="?/edit" id="form_edit">
			<input type="hidden" name="id_" value={user.id}>
			<input type="hidden" name="username" value={user.username}>
			<input  type="hidden" name="SN1_og" value="{currentSelectedList.SN1}"> 
			<input  type="hidden" name="SN2_og" value="{currentSelectedList.SN2}"> 
			<div class="grid grid-cols-3 gap-y-4">
				<input type="hidden" name="id" value="{currentSelectedList.id}">
				<h2 class="mr-2 my-auto" >Edit item name: <span class="required">*</span></h2>
				<input  class="box"	 type="text" name="itemname" autocomplete="off"
				required value="{currentSelectedList.itemname}" id="itemname">
				<h2 class="mr-2 my-auto" id="SN1" >SN1: </h2>
				<input  class="box" type="text" name="SN1"
				value="{currentSelectedList.SN1}" autocomplete="off"> 
				<h2 class="mr-2 my-auto" id="SN2">SN2: </h2>
				<input  class="box" type="text" name="SN2"
				value="{currentSelectedList.SN2}" autocomplete="off"> 
				<h2 class="mr-2 my-auto" id="category">Label Category: <span class="required">*</span></h2>
				<select class="box overflow-y-auto " name="category" id="category" value={currentSelectedList.category}>
					<option value="" disabled selected>Select an option</option>
					{#each categories as category}
						<option value="{category.id}">{category.categoryname}</option>
					{/each}
				</select>
				<h2 class="mr-2 my-auto" id="us">Is Item Unusable: </h2>
				{#if currentSelectedList.us == 0}
					<input type="checkbox" name="us" value=1 class="col-span-2" id="us">
				{:else if currentSelectedList.us == 1}
					<input type="checkbox" name="us" value=1 class="col-span-2" id="us" checked>
				{/if}
				<h2 class="mr-2" id="remarks">remarks: </h2>
				<textarea class="box h-20 overflow-y-auto" 
				name="remarks" id="remarks">{currentSelectedList.remarks}</textarea>
				<input type="submit" class="submit" name="" id="">
				<button type="button" onmousedown={closeModal} class="col-span-3">close modal</button>
			</div>
		</form><br>
	</div>

</dialog>