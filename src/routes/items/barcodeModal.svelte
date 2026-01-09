<script lang="ts">
    import { browser } from "$app/environment";
    let { selecteditems, 
          barcodeIsOpen = $bindable()
    } = $props()
    let dialog = $state<HTMLDialogElement>()
    
    function checkAll() {
        if (browser) {
            const mainCheck = document.getElementById("checkall")
            if (mainCheck != null && mainCheck.checked) {
                document.querySelectorAll(`input[type="checkbox"]`).forEach(x => {
                    x.checked = true
                })
            } else if (mainCheck != null && !mainCheck.checked) {
                document.querySelectorAll(`input[type="checkbox"]`).forEach(x => {
                    x.checked = false
                })                
            }
        }
    }

    function closeModal() {
        barcodeIsOpen = false
    }

    function printBarCode() {
        const checkedCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"][class="tocheck"]:checked'));
        const checkedValues = checkedCheckboxes.map(checkbox => checkbox.value);
        if (checkedValues.length > 0) generatePDF(checkedValues);
    }

    function generatePDF(words) {

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        let x = 10, y = 10;
        const barcodeHeight = 15, barcodeWidth = 40, borderPadding = 1;
        words.forEach((word: string) => {
            let text = word.split(";;")[1]
            const canvas = document.createElement('canvas');
            JsBarcode(canvas, word.split(";;")[0].trim(), {
                format: "CODE39",
                height: barcodeHeight,
                width: 1,
                text
            });
            const imgData = canvas.toDataURL('image/png');
            doc.rect(
                x - borderPadding,
                y - borderPadding,
                barcodeWidth + (borderPadding * 2),
                barcodeHeight + (borderPadding * 2)
            );
            doc.addImage(imgData, 'PNG', x, y, barcodeWidth, barcodeHeight);
            x += barcodeWidth + 10;
            if (x > 170) {
                x = 10;
                y += barcodeHeight + 10;
            }
            if (y > 250) {
                doc.addPage();
                x = 10;
                y = 10;
            }
        });
        doc.save('barcodes.pdf');
    }

	$effect(() => {
		if (!dialog) return;

		if (barcodeIsOpen) {
			dialog.showModal();
		} else if (barcodeIsOpen == false){
			dialog.close()

		}
	})

</script>

<dialog
	bind:this={dialog}
	onclose={() => (barcodeIsOpen = false)}
	onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>
<div class="internal">
    <h2 class="title">Select items:</h2>
        <div class="mx-auto max-h-[40vh] w-full overflow-y-auto mb-3">
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th><input type="checkbox" id="checkall" oninput={checkAll}></th>
                    </tr>
                </thead>
                <tbody>
                    {#each selecteditems as row}
                    <tr class="hover">
                        <td><h2>{row.id}</h2></td>
                        <td><h2>{row.itemname}</h2></td>
                        <td>
                            <input type="checkbox" 
                            value="{row.id};;{row.itemname}"
                            name="{row.id} {row.itemname}"
                            class="tocheck">
                        </td>
                    </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <button class="mb-3 w-full submit" onclick="{printBarCode}">Print</button>
        <button class="mb-3 w-full" onclick="{closeModal}">Close</button>
    </div>
</dialog>

