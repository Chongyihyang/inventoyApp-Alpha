<script lang="ts">
	import { onMount } from 'svelte';
	
	
	// Types
	type Item = {
		id: Number;
		itemname: string;
		SN1: string | null;
		SN2: string | null;
		originalholder: string | null;
		currentholder: number | null;
		remarks?: string;
		scanned?: boolean
	};

	type Department = {
		id: string;
		departmentname: string;
	};

	type FormData = {
		error?: string;
		action?: 'edit' | 'add' | 'delete';
		success?: boolean;
	};


	// Props
	let { data, form } = $props<{
		data: {
			departments: Department[];
			items: Item[];
			currentdept: number | null;
			currentrole: string | null;
			user: string
		};
		form?: FormData;
	}>();
	const { items, currentdept } = data;
	let user = $state(data.user)

	// State
	let scannerBuffer = ''
	let scannerTimeout: NodeJS.Timeout
	const SCANNER_DELAY = 100 // ms
	const scannedItems = new Map<string, number>()
	let statusMessage: HTMLDivElement
	let selecteditems: Item[] = $state([])
	let accounted = $state(0);
	let selecteddept = $state(currentdept)
	let counted = $state(0)
	let results = $state("")
	
	// Fast typing detection for barcode scanner
	let lastKeyTime = 0;
	let keySequence = '';
	let fastTypingTimeout: NodeJS.Timeout;
	const FAST_TYPING_THRESHOLD = 100; // ms between keys to consider it "fast typing"
	const MIN_SEQUENCE_LENGTH = 3; // minimum keys to trigger barcode mode

	// Utility Functions

	function playAlertSound() {
    	const sound = document.getElementById('alertSound') as HTMLVideoElement | null
		if (sound) {
			sound.play().catch((error: string) => {
				console.error("Error playing sound:", error);
			});
		}
	}

	function filterSelectedItems() {
		selecteditems = items
		.filter((row: Item) => row.currentholder === Number(selecteddept))

		// Reset all counters when department changes
		accounted = 0;
		counted = 0;
		scannedItems.clear();

		selecteditems.forEach((row: Item) => {
			row.scanned = false
		});
	}

	function validateCounters() {
		// Ensure counters never exceed total items
		if (accounted > selecteditems.length) {
			console.warn(`Accounted (${accounted}) exceeds total items (${selecteditems.length}), resetting...`);
			accounted = selecteditems.length;
		}
		if (counted > selecteditems.length) {
			console.warn(`Counted (${counted}) exceeds total items (${selecteditems.length}), resetting...`);
			counted = selecteditems.length;
		}
	}

	function showStatus(message: string, isSuccess: boolean) {
		statusMessage.textContent = message;
		statusMessage.style.display = 'block';
		statusMessage.className = isSuccess
			? 'bg-green-800 text-white pl-3 ml-3 rounded-2xl w-[50%]'
			: 'bg-red-800 text-white pl-3 ml-3 rounded-2xl w-[50%]';
		setTimeout(() => (statusMessage.style.display = 'none'), isSuccess ? 3000 : 6000);
	}

	function handleBarcodeScan() {
		const barcode: string = scannerBuffer.trim();
		scannerBuffer = '';
		if (!barcode) return;
		const foundItem = selecteditems.find((x) => x.id === Number(barcode));
		if (foundItem) {
			if (!scannedItems.has(barcode)) {
				accounted += 1
				showStatus(`Added: ${foundItem.itemname}`, true);
				scannedItems.set(barcode, 1);
				const rowElem = document.getElementById(barcode)
				const rowButton = document.querySelector(`input[type="checkbox"][name="${barcode}"]`)
				foundItem.scanned = true
				if (rowElem) {
					rowElem.className = 'hover text-green-400';
					(rowElem as HTMLElement).focus();
				}
				if (rowButton) {
					(rowButton as HTMLInputElement).checked = true
				}
				// Remove duplicate counter increment
				// counted += 1  // REMOVED - accounted already tracks this
				validateCounters(); // Ensure counters stay within bounds
			} else {
				showStatus(`Item already scanned`, false);
			}
		} else {
			playAlertSound()
			showStatus(`Invalid barcode: ${barcode}`, false);
		}
		const barcodeInput = document.getElementById("barcodeInput")
		if (barcodeInput != null) {
			barcodeInput.focus()
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

	onMount(async () => {
		window.onbeforeunload = function (e) {
			return "You have unsaved changes. Are you sure you want to leave?";
		};
	})


	// Effects
	$effect(() => {
		results = JSON.stringify(selecteditems) 
		validateCounters(); // Ensure counters stay within bounds
	});
	
	// Add global keyboard listener for fast typing detection
	$effect(() => {
		const handleGlobalKeydown = (e: KeyboardEvent) => {
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

	// Initial population
	filterSelectedItems();
	</script>

<div class="form-group mx-auto max-h-[50vh] w-[90%] mt-3" id="main">
	<a href="/stocktake/history" class="text-decoration-line: underline">Check Stocktake Transactions →</a>
	<h1>{accounted} / {selecteditems.length}</h1>
	<div class="flex">
		<label for="barcodeInput">Barcode Scanner Input:</label>
		<div bind:this={statusMessage}></div>
	</div>
	<input type="text" placeholder="Scan items here" 
	autocomplete="off" class="text" id="barcodeInput" 
	oninput={(e) => {receiveBarcode(e)}}>

	<br />
	<br />
	<div class="mx-auto max-h-[50vh] w-full overflow-y-auto mb-3">
		<audio id="alertSound" src="src\routes\stocktake\sound.mp3" preload="auto" class="hidden"></audio>
		<table class="m-0 mx-auto w-full">
			<thead>
				<tr>
					<th>Name</th>
					<th>SN1</th>
					<th>SN2</th>
					<th>Remarks</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each selecteditems as row}
					<tr class="hover" id={String(row.id)}>
						<td><h2 class="font-medium whitespace-nowrap">{row.itemname}</h2></td>
						<td><h2>{row.SN1}</h2></td>
						<td><h2>{row.SN2}</h2></td>
						<td><h2>{row.remarks}</h2></td>
						<td>
							<input type="checkbox" 
							name={String(row.id)} onchange="{() => {
								const rowElem = document.getElementById(String(row.id))
								const rowButton = document.querySelector(`input[type="checkbox"][name="${String(row.id)}"]`)
								if (rowElem && rowButton) {
									if (!rowButton.checked) {
										accounted -= 1
										rowElem.classList.remove("text-green-400");
										rowElem.className = 'text-gray-400'
										scannedItems.delete(String(row.id))
										row.scanned = false
									} else {
										accounted += 1
										rowElem.className = 'text-green-400'
										row.scanned = true
									}
								}
							}}">
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<form action="?/submit" method="POST">
		<input type="hidden" bind:value={results} name="items">
		<input type="hidden" name="user" bind:value={user}>
		<button  class="w-full">Submit</button>
	</form>
</div>

