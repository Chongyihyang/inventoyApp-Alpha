<script lang="ts">

	// init types
    type FormData = {
        error?: string
    }

	// Props with type annotations
	let { 
		editIsOpen = $bindable<boolean>(),
		form = $bindable<FormData>(),
		currentSelectedList = $bindable(),
		user = $bindable()
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
		<h2 class="title">Edit properties for {currentSelectedList.categoryname}</h2>
		{#if form?.error && form?.action === 'edit'}
			<p id="error" bind:this={error} >{form.error}</p>
		{/if}
		<form method="POST" action="?/edit" id="form">
			<div class="grid grid-cols-3 gap-y-4">
				<input type="hidden" name="id_" value={user.id}>
				<input type="hidden" name="username" value={user.username}>
				<input type="hidden" name="id" value={currentSelectedList.id}>
				<input type="hidden" name="categorynameoriginal" value={currentSelectedList.categoryname}>
				<h2 class="my-auto grid" id="categoryname">Edit category name: </h2>
				<input class="box" type="text" name="categoryname" autocomplete="off" value={currentSelectedList.categoryname} required>
				<input type="submit" class="submit" name="" id="">
				<button type="button" onmousedown={closeModal} class="col-span-3">close modal</button>
			</div>
		</form><br>
	</div>

</dialog>