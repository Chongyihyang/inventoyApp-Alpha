<script lang="ts">

    let { 
        viewIsOpen = $bindable(),
        items = $bindable()
     } = $props()
    let dialog = $state<HTMLDialogElement>()

    let itemsJSON = $state()
    $effect(() => {
        if (!dialog) return;
        
		if (viewIsOpen) {
            if (items != undefined) {
                itemsJSON = JSON.parse(items)
            }
			dialog.showModal();
		} else if (viewIsOpen == false){
			dialog.close()

		}
	})

	function closeModal() {
		viewIsOpen = false
	}
</script>

<dialog
bind:this={dialog}
onclose={() => (viewIsOpen = false)}
onmousedown={(e) => { if (e.target === dialog) closeModal()}}>

    <h1 class="title">Items scanned</h1>
    <div class=" w-[90%] mx-auto mb-3">
        <div class="max-h-[60vh] overflow-y-auto mb-3">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>SN1</th>
                        <th>SN2</th>
                        <th>Remarks</th>
    
                    </tr>
                </thead>
                <tbody>
                    {#each itemsJSON as item}
                        {#if item.scanned}
                            <tr class="text-green-400">
                                <td>{item.itemname}</td>
                                <td>{item.SN1}</td>
                                <td>{item.SN2}</td>
                                <td>{item.remarks}</td>
                            </tr>
                        {:else}
                        <tr >
                            <td>{item.itemname}</td>
                            <td>{item.SN1}</td>
                            <td>{item.SN2}</td>
                            <td>{item.remarks}</td>
                        </tr>
                        {/if}
                    {/each}
                </tbody>
            </table>
        </div>
        <button type="button" onmousedown={closeModal} class="w-full">close modal</button>
    </div>
</dialog>