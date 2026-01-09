<script lang="ts">


	type Results = {
		totalItems: number,
		successCount: number,
		errorCount: number,
		successfulItems: Array<string>,
		failedItems: Array<string>,
		details: Array<string>
    };

    // Props with type annotations
    let { 
        importIsOpen = $bindable<boolean>(),
        form = $bindable<FormData>(),
		importResults = $bindable<Results>(),
    } = $props()

    let dialog = $state<HTMLDialogElement>()
	// Effect to handle modal open/close
	$effect(() => {
		if (!dialog) return;

		if (importIsOpen) {
			dialog.showModal()
		} else {
			dialog.close()
		}

    })

    function closeModal() {
        importIsOpen = false
    }


</script>

<dialog
	bind:this={dialog}
	onclose={() => (importIsOpen = false)}
	onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>
<div class="internal">
	<div id="importResultsModal" class="modal">
		<div class="modal-content">
			<div class="modal-header">
				<span class="modal-title" id="modalTitle">Import Results ({importResults.successCount} success,
					{importResults.errorCount} errors)
				</span>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span class="close-btn" id="closeModalBtn" onclick="{closeModal}">&times;</span>
			</div>
			<div id="importSummary" class="mb-5">
				<p>Total items processed: <strong>{importResults.totalItems}</strong></p>
				<p>Successfully imported: <strong style="color: #0d652d;">{importResults.successCount}</strong></p>
				<p>Failed imports: <strong style="color: #c5221f;">{importResults.errorCount}</strong></p>
			</div>
			<div class="mb-5">
				<div class="font-bold mb-2.5 text-gray-500">Successful Imports</div>
				<div id="successfulImports">
					{#if importResults.successfulItems.length === 0}
						<p>No items were successfully imported</p>
					{:else}
						{#each importResults.successfulItems.slice(0,5) as i}
							<div>{i.itemid}</div>
						{/each}
						{#if importResults.successfulItems.length > 5}
							<p>{importResults.successfulItems.length - 5} more items</p>
						{/if}
					{/if}
				</div>
			</div>
			<div class="mb-5">
				<div class="font-bold mb-2.5 text-gray-500">Failed Imports</div>
				<div id="failedImports">
					{#if importResults.failedItems.length === 0}
						<p>No items failed to imported</p>
					{:else}
						{#each importResults.failedItems.slice(0,5) as i}
							<div>{i.itemid}</div>
						{/each}
						{#if importResults.failedItems.length > 5}
							<p>{importResults.failedItems.length - 5} more error(s)</p>
						{/if}
					{/if}
				</div>
			</div>
			<div class="mb-5">
				<div class="font-bold mb-2.5 text-gray-500">Import Details</div>
				<table class="w w-full border-collapse mt-2.5">
					<tbody id="importDetails">
						<tr>
							<td>Row</td>
							<td>Item ID</td>
							<td>Status</td>
							<td>Message</td>
						</tr>
						{#each importResults.details as item}
							<tr>
								<td>{item.row}</td>
								<td>{item.itemid}</td>
								<td>{item.status}</td>
								<td>{item.messages || "-"}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<button id="closeModalBtn2" 
			style="margin-top: 20px;" onclick="{closeModal}">Close</button>
		</div>
	</div>
</div>

</dialog>

<style>

	table {
		width: 100%;
		border-collapse: collapse;
		margin: 20px 0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}


	tr:hover {
		background-color: rgba(66, 133, 244, 0.05);
	}



	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #ddd;
		padding-bottom: 10px;
		margin-bottom: 15px;
	}

	.modal-title {
		font-size: 1.5em;
		font-weight: bold;
	}

	.close-btn {
		font-size: 1.5em;
		cursor: pointer;
		color: #f2f2f2;
	}

	.close-btn:hover {
		color: #333;
	}

</style>
