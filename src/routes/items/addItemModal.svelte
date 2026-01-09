<script lang="ts">
	import type { Categories } from "$lib/server/db/schema";
	import type { User } from "$lib/utils";
	// done refactoring add logic
	// init types
    type Department = {
        id: string
        departmentname: string
    }

    type FormData = {
        error?: string
    }

    // Props with type annotations
    let { 
        addIsOpen = $bindable<boolean>(),
        form = $bindable<FormData>(),
        departments = $bindable<Department[]>(),
		user = $bindable<User>(),
		categories = $bindable<Categories>(),
    } = $props()

    let dialog = $state<HTMLDialogElement>()
	// Effect to handle modal open/close
	$effect(() => {
		if (!dialog) return
		
		if (addIsOpen) {
			dialog.showModal()
		} else {
			dialog.close()
		}

    })

    function closeModal() {
        addIsOpen = false
    }


</script>

<dialog
	bind:this={dialog}
	onclose={() => (addIsOpen = false)}
	onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>
<div class="internal">
	<h2 class="title">Create new item</h2>	
	<!-- Only show error if it's from the add action -->
	{#if form?.error && form?.action === 'add'}
		<p class="error">{form.error}</p>
	{/if}
	<form method="POST" action="?/create" id="form">
		<div class="grid grid-cols-3 gap-y-4">
			<input type="hidden" name="id_" value={user.id}>
			<input type="hidden" name="username" value={user.username}>
			<h2 class="mr-2 my-auto" id="itemname">New item name: <span class="required">*</span></h2>
			<input  class="box"	 type="text" name="itemname" autocomplete="off" required>
			<h2 class="mr-2 my-auto" id="SN1">SN1: </h2>
			<input  class="box" type="text" name="SN1" autocomplete="off"> 
			<h2 class="mr-2 my-auto" id="SN2">SN2: </h2>
			<input  class="box" type="text" name="SN2" autocomplete="off"> 
			<h2 class="mr-2 my-auto" id="SLOCHolder">Current Holder: <span class="required">*</span></h2>
			<select class="box overflow-y-auto"  name="currentholder" id="currentholder" required>
				<option value="" disabled selected>Select an option</option>
				{#each departments as department}
					<option value="{department.id}">{department.departmentname}</option>
				{/each}
			</select>
			<h2 class="mr-2 my-auto" id="originalholder">Original Holder: <span class="required">*</span></h2>
			<select class="box overflow-y-auto " name="originalholder" id="originalholder">
				<option value="" disabled selected>Select an option</option>
				{#each departments as department}
					<option value="{department.id}">{department.departmentname}</option>
				{/each}
			</select>
			<h2 class="mr-2 my-auto" id="category">Label Category: <span class="required">*</span></h2>
			<select class="box overflow-y-auto " name="category" id="category">
				<option value="" disabled selected>Select an option</option>
				{#each categories as category}
					<option value="{category.id}">{category.categoryname}</option>
				{/each}
			</select>
			<h2 class="mr-2 my-auto" id="us">Is Item Unusable: </h2>
			<input type="checkbox" name="us" value=1 class="col-span-2" id="us">
			<h2 class="mr-2" id="remarks">Remarks: </h2>
			<textarea class="box overflow-y-auto h-30" name="remarks" id="remarks"></textarea>
			<input type="submit" class="submit" name="" id="">
			<button type="button" onmousedown={closeModal} class="col-span-3">close modal</button>
		</div>
	</form><br>
</div>

</dialog>

