<script lang="ts">
	// done refactoring delete logic
	type Item = {
		id: string;
		itemname: string;
		[key: string]: unknown; // For other potential properties
	};

	type FormData = {
		error?: string;
	};

	// Props with type annotations
	let { 
		deleteIsOpen = $bindable<boolean>(), 
		currentSelectedList = $bindable<Item>(), 
		form = $bindable<FormData>(),
		user = $bindable()
	} = $props()

	let dialog = $state<HTMLDialogElement>()

	// Effect to handle modal open/close
	$effect(() => {
		if (!dialog) return;

		if (deleteIsOpen) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	function closeModal() {
		deleteIsOpen = false;
	}

</script>

<dialog
	bind:this={dialog}
	onclose={() => (deleteIsOpen = false)}
	onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>
	<h2 class="title">Deleting item</h2>
    <h2 class="mx-auto w-fit">Are you sure you want to delete item: {currentSelectedList["itemname"]}? <span class="required">*</span></h2>
	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}
	<div class="internal">
		<form method="POST" action="?/delete">
			<input type="hidden" name="id_" value={user.id}>
			<input type="hidden" name="username" value={user.username}>
			<input type="hidden" name="id" value="{currentSelectedList["id"]}">
			<input type="hidden" name="SN1" value="{currentSelectedList["SN1"]}">
			<input type="hidden" name="SN2" value="{currentSelectedList["SN2"]}">
			<input type="hidden" name="itemname" value="{currentSelectedList["itemname"]}">
			<div class="w-fit mx-auto">
				<input class="box" type="text" name="confirmation" placeholder="Type in the item's name to delete" required>
				<input type="submit" value="✅" class="submit"/>
				<button onmousedown="{closeModal}" type="button">❌</button>
			</div>
		</form>
	</div>
</dialog>