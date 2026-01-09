<script lang="ts">
	import Viewmodal from "./viewmodal.svelte";

	// Props
	let { data } = $props<{
		data: {
        
		}
	}>();
	const { stocktake } = data;
	const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    let viewIsOpen = $state(false)
    let items = $state()


	// Effects
	$effect(() => {
        if (viewIsOpen) {
        }
	});

    function openModal(item: unknown) {
        items = item
        viewIsOpen = true
    }
	

	const jsonToCsv = (jsonData) => {
		// Specify how to handle null/undefined values (e.g., replace with empty string)
		const replacer = (key, value) => (value === null || value === undefined ? '' : value);
		
		// Extract the headers from the first object's keys
		const header = Object.keys(jsonData[0]);
		
		// Map data rows and stringify values to handle potential special characters like commas
		const csv = jsonData.map(row => 
			header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
		);
		
		// Add the header row to the beginning of the CSV array
		csv.unshift(header.join(','));
		
		// Join all rows with a newline character to create the final CSV string
		return csv.join('\r\n');
	};
	
	function saveFile(item: string, name: string, type:string) {
		const data = jsonToCsv(JSON.parse(item));
		const blob = new Blob([data], { type: 'text/plain'});
		const url = URL.createObjectURL(blob);

		// Create a link element to trigger the download
		const a = document.createElement('a');
		a.href = url;
		a.download = name + type; // Specify the default file name
		document.body.appendChild(a); // Append link to body
		a.click(); // Simulate a click to trigger download

		// Clean up by removing the link and revoking the object URL
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<Viewmodal bind:viewIsOpen {items}/>


<div class="internal" id="main">

	<div class="mx-auto max-h-[45vh] w-[90%] overflow-y-auto mb-3">
		<table class="w-full">
			<thead>
				<tr>
					<th>Accounted by:</th>
					<th>Time</th>
					<th></th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each stocktake as row}
					<tr class="hover" id={row.id}>
						<td><h2>{row.name}</h2></td>
						<td><h2>{new Date(row.time).toLocaleString('en-sg', options)}</h2></td>
						<td><button onclick="{() => {
                            openModal(row.items)
                        }}">View</button></td>
						<td>
							<button onclick="{saveFile(row.items, row.time, ".csv")}">⬇️</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

