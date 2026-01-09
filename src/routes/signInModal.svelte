<script lang="ts">
	import Dropdown from "$lib/dropdown.svelte";
	import { enhanceFormSubmission } from "$lib/client/network";
	import { onMount } from 'svelte';
	import { browser } from '$app/environment'
		// Type declaration
		type item = {
		id: string,
		itemname: string,
		itemid: string,
		outtime: number,
		issuer: string,
		issuerid: number,
		issuee: string,
		issueeid: number
	}
	type Transaction = {
		id: string,
		itemname: string,
		SN1: string,
		SN2: string,
		remarks: string,
		currentholder: number,
		originalholder: number,  		
	}
	type Detail = {
		itemname: string,
		issuee: string | null
	}

	// --- Globals ---
	let scannerBuffer = ''
	let scannerTimeout: NodeJS.Timeout
	const SCANNER_DELAY = 90 // ms
	const scannedItems = new Map()
	let statusMessage: HTMLDivElement
	let formElement: HTMLFormElement
	let dialog: HTMLDialogElement // HTMLDialogElement
	let { signInModalOpen = $bindable(), data, form } = $props()
	
	// Initialize network resilience on mount
	onMount(() => {
		if (formElement) {
			enhanceFormSubmission(formElement);
		}
		
		// Add global keyboard listener for fast typing detection
		const handleGlobalKeydown = (e: KeyboardEvent) => {
			if (!signInModalOpen) return;
			
			const currentTime = Date.now();
			
			// Detect fast typing (barcode scanner typically types very fast)
			if (currentTime - lastKeyTime < FAST_TYPING_THRESHOLD) {
				keySequence += e.key;
				clearTimeout(fastTypingTimeout);
				
				// If we have a fast sequence, focus on barcode input
				if (keySequence.length >= MIN_SEQUENCE_LENGTH) {
					const barcodeInput = document.getElementById("barcodeInput") as HTMLInputElement;
					if (barcodeInput && document.activeElement !== barcodeInput) {
						e.preventDefault();
						barcodeInput.focus();
						showStatus('Fast typing detected - activated barcode mode', true);
					}
				}
				
				// Reset fast typing detection after delay
				fastTypingTimeout = setTimeout(() => {
					keySequence = '';
				}, 500);
			} else {
				// Reset sequence if typing is slow
				keySequence = '';
			}
			
			lastKeyTime = currentTime;
		};
		
		document.addEventListener('keydown', handleGlobalKeydown);
		
		return () => {
			document.removeEventListener('keydown', handleGlobalKeydown);
		};
	});
	
	// Fast typing detection for barcode scanner
	let lastKeyTime = 0;
	let keySequence = '';
	let fastTypingTimeout: NodeJS.Timeout;
	const FAST_TYPING_THRESHOLD = 100; // ms between keys to consider it "fast typing"
	const MIN_SEQUENCE_LENGTH = 3; // minimum keys to trigger barcode mode
	let itemList: Array<string> = $state([])
	let rows: item[] = $state(data.items)
	let inventoryList: Transaction[] = $state(data.inventoryList)
	let itemDatabase: Record<string, Detail> = $derived(init_(inventoryList, rows))
	

	function playAlertSound() {
    	const sound = document.getElementById('alertSound') as HTMLVideoElement | null
		if (sound) {
			sound.play().catch((error: string) => {
				console.error("Error playing sound:", error);
			});
		}
	}
		
	function init_(inventoryList: Transaction[], rows: item[]) {
		const db: Record<string, Detail> = {}
		inventoryList.map((x) => {
			db[x.id] =  {"itemname": x.itemname, "issuee": null}
		})
		rows.map((x) => {
			db[x.itemid] = {"itemname": x.itemname, "issuee": x.issuee}
		})
		return db
	}

	
	$effect(() => {
		if (signInModalOpen) {
			dialog.showModal()
			itemList = []
			statusMessage.style.display = 'none'
		};
	});
	

	const closeModal = () => {
		formElement.reset()
		scannedItems.clear()
		dialog.close()
		signInModalOpen = false
		statusMessage.style.display = 'none'
	}


    function handleBarcodeScan() {
        const barcode: string = scannerBuffer.trim();
        scannerBuffer = '';
        if (!barcode) return
        if (itemDatabase && itemDatabase[barcode]) {
            if (!scannedItems.has(barcode)) {
                if (itemDatabase[barcode].issuee != null) {
					itemList.push(barcode)
					scannedItems.set(barcode, itemDatabase[barcode])
                    showStatus(`Added: ${itemDatabase[barcode].itemname}`, true)
                } else {
                    showStatus(`Item not signed out`, false);
                }
            } else {
                showStatus(`Item already scanned: ${itemDatabase[barcode].itemname}`, false);
            }
        } else {
			playAlertSound()
            showStatus(`Invalid barcode: ${barcode.substring(0, 13)}`, false);
        }
		const barcodeInput = document.getElementById("barcodeInput")
		if (browser && barcodeInput != null) {
			barcodeInput.focus()
		}
    }


    function showStatus(message: string, isSuccess: boolean) {
        statusMessage.textContent = message
		statusMessage.style.display = 'block'
        if (isSuccess) {
			statusMessage.className = "bg-green-800 text-white pl-3 ml-3 rounded-2xl w-[50%]"
			setTimeout(() => statusMessage.style.display = 'none', 3000)
        } else {
			statusMessage.className = "bg-red-800 text-white pl-3 ml-3 rounded-2xl w-[50%]"
			setTimeout(() => statusMessage.style.display = 'none', 6000)
		}
    }

	function receiveBarcode(e: Event) {
		if (!(e.target as HTMLInputElement).value) return
					
					// Add to buffer and clear input
					scannerBuffer += (e.target as HTMLInputElement).value;
					(e.target as HTMLInputElement).value = ''

					
					// Reset timeout
					clearTimeout(scannerTimeout)
					
					// Set timeout to detect end of scan
					scannerTimeout = setTimeout(handleBarcodeScan, SCANNER_DELAY)
	}

	const reset = () => {
		itemList = []
		showStatus('Cleared all items', true)
	}


</script>

<dialog
	bind:this={dialog}
	onclose={() => (signInModalOpen = false)}
	onmousedown={(e) => { if (e.target === dialog) {
		itemList = []
		closeModal()
	}}}
>
<div class="internal">
	<audio id="alertSound" src="src\routes\stocktake\sound.mp3" preload="auto" class="hidden"></audio>
	<h1 class="title">Inventory Sign-In</h1>
	{#if form?.error && form?.action == 'signin'}
		<p class="error">{form.error}</p>
	{/if}
	<form method="POST" action="?/signin" id="form" bind:this={formElement}>

		<input type="hidden" value="{data.currentuser.id}" name="issuer">
		
		<div class="form-group">
			<label for="barcodeInput">Barcode Scanner Input:<span class="required">*</span></label>
			<input type="text" placeholder="Scan items here" 
			autocomplete="off" class="text" id="barcodeInput"
			oninput="{(e) => {receiveBarcode(e)}}">
		</div>
		
		<div class="form-group">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<div class="flex">
				<label >Items to Sign In:</label>
				<div bind:this={statusMessage}></div>
			</div>
			<input type="hidden" name="items" bind:value={itemList}>
			<div id="itemList">
				<div class="empty">
					{#if itemList.length == 0}
						No items scanned yet
					{:else}
					{#each itemList as item}	
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<div class="empty text-left px-3 py-2 leading-5 text-gray-500 flex justify-between">
							<div class="text-white">{itemDatabase[item].itemname}</div>
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="justify-right cursor-pointer text-red-800" onmousedown="{() => {
								itemList = itemList.filter(x => x != item)
								scannedItems.delete(item)
							}}">✕</div>						
						</div>					
					{/each}
					{/if}
				</div>
			</div>
		</div>
		
		
		<button id="submitBtn" class="button-normal" type="submit">Submit Sign-in</button>
		<button type="button" id="clearBtn" onmousedown="{() => {
			setTimeout(reset, 10)
			scannedItems.clear()
		}
		}" class="button-normal">Clear All Items</button>
		<button onmousedown={() => {
			itemList = []
			closeModal()
			}} type="button" class="close">close modal</button>
	</form>
</div>
</dialog>

