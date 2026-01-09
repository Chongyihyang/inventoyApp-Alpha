<script lang="ts">
	import type { PageServerData } from './$types';
	const DEBUG = false
	type Transactions = {
		time: number,
		item: string
	}


	function debugPrint(x: string, y: unknown) {
		console.log(x + ": \n---------------------")
		console.log(y)
		console.log("--------END---------")
	}

	let { data }: { data: PageServerData } = $props();
	let selectedtransactions: Transactions[] = data.items
	let dateInput: HTMLFormElement

	if (DEBUG) {
		debugPrint("data.items", data.items)

	}
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }



</script>
<form action="?/changedate" 
method="POST"
class="mx-auto w-fit flex gap-10 mt-3"
bind:this={dateInput}>
	<div class="flex max-sm:grid">
		<h1 class="title">Logs</h1>
		<input type="date"
		onchange="{() => {
			dateInput.submit()
		}}" name="date"
		class="m-3">
	</div>
</form>
<div class="mx-auto max-h-[70vh] w-[90%] overflow-y-auto mb-3">
	<table>
		<thead>
			<tr>
				<th>Time</th>
				<th>Action</th>
			</tr>
		</thead>
		<tbody>
			{#each selectedtransactions as row}
			<tr class="hover">
				<td><h2>{new Date(row.time).toLocaleString('en-sg', options)}</h2></td>
				<td><h2>{row.item}</h2></td>
			</tr>
			{/each}
		</tbody>
	</table>
</div>


