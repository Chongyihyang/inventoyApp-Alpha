<script lang="ts">
	// done refactoring add logic
	// init types
	import Password from "$lib/password.svelte";

    type FormData = {
        error?: string
    }

    // Props with type annotations
    let { 
        addIsOpen = $bindable<boolean>(),
        form = $bindable<FormData>(),
		user = $bindable()
    } = $props()

    let dialog = $state<HTMLDialogElement>()
	let password = $state("")
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
	<h2 class="title">Create new department</h2>	
	<!-- Only show error if it's from the add action -->
	{#if form?.error && form?.action === 'add'}
		<p class="error">{form.error}</p>
	{/if}
	<form method="POST" action="?/create" id="form">
		<div class="grid grid-cols-3 gap-y-4">
			<input type="hidden" name="id_" value={user.id}>
			<input type="hidden" name="username" value={user.username}>
			<h2 class="my-auto grid" id="itemname">New department name: </h2>
			<input class="box" type="text" name="categoryname" autocomplete="off" required>
			
			<!-- Superadmin Password Section -->
			<div class="col-span-3">
				<h3 class="font-bold text-lg mb-2">Create Superadmin Account</h3>
				<p class="text-sm text-gray-600 mb-4">A superadmin account will be created with username: [DEPARTMENTNAME]ADMIN</p>
			</div>
			
			<Password {password}/> 
			<h2 class="mr-2 my-auto" id="passwordretype">Password Retype:  <span class="required">*</span></h2>
			<input  class="box" type="password" name="passwordretype" required> 
			
			<input type="submit" class="submit" name="" id="">
			<button type="button" onmousedown={closeModal} class="col-span-3">close modal</button>
		</div>
	</form><br>
</div>

</dialog>

