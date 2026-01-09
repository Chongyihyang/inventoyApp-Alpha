<script lang="ts">
	// done refactoring add logic
	// init types

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
			<input type="submit" class="submit" name="" id="">
			<button type="button" onmousedown={closeModal} class="col-span-3">close modal</button>
		</div>
	</form><br>
</div>

</dialog>

