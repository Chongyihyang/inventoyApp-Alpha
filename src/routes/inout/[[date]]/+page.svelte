<script lang="ts">
	import { department } from '$lib/shared.svelte';
	import type { PageServerData } from '../$types';
	const DEBUG = false
	type Transactions = {
		id: number,
		itemname: string | null,
		itemid: string | null,
		outtime: number,
		inttime: number | null,
		issuer: string | null,
		issuerid: string | null,
		issuerdept: number | null,
		issuee: string | null,
		issueeid: string | null
	}


	function debugPrint(x: string, y: unknown) {
		console.log(x + ": \n---------------------")
		console.log(y)
		console.log("--------END---------")
	}

	let { data }: { data: PageServerData } = $props();
	let selectedtransactions: Transactions[] = $derived(changeSelectedTransactions(data.items, department.current.value))
	let dateInput: HTMLFormElement

	if (DEBUG) {
		debugPrint("data.items", data.items)
		debugPrint("data.departmentList", data.departmentList)
	}
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
	
    function changeSelectedTransactions(transactions: Transactions[], selecteddept_: number) {
        let selectedtransactions_: Transactions[] = []
        transactions.forEach((row: Transactions) => {
            if (row.issuerdept == selecteddept_) {
                selectedtransactions_.push(row)
            }})
        return selectedtransactions_
    }


</script>
<form action="?/changedate" 
method="POST"
class="mx-auto w-fit flex gap-10 mt-3"
bind:this={dateInput}>
	<div class="flex max-sm:grid">
		<h1 class="title">Transactions</h1>
		<input type="date"
		onchange="{() => {
			dateInput.submit()
		}}" name="date"
		class="m-3">
	</div>
</form>
<div class="mx-auto max-h-[50vh] w-[90%] overflow-y-auto mb-3">
	<table >
		<thead>
			<tr>
				<th>Name</th>
				<th>Issuer</th>
				<th>Issuee</th>
				<th>Out time</th>
				<th>In time</th>

			</tr>
		</thead>
		<tbody>
			{#each selectedtransactions as row}
			<tr class="hover">
				<td><h2>{row.itemname}</h2></td>
				<td><h2>{row.issuer}</h2></td>
				<td><h2>{row.issuee}</h2></td>
				<td><h2>{new Date(row.outtime).toLocaleString('en-sg', options)}</h2></td>
				{#if row.inttime == null}
					<td></td>
				{:else}
					<td><h2>{new Date(row.inttime).toLocaleString('en-sg', options)}</h2></td>
				{/if}
			</tr>
			{/each}
		</tbody>
	</table>
</div>


