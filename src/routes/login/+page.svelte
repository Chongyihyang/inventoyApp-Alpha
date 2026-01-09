<script lang="ts">
	// import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h2 class="title">Login</h2>
<form method="post" action="?/login" >
	<div class="internal grid grid-cols-3 gap-y-4 w-[40vw] mx-auto border-2 border-white rounded-2xl p-3 max-sm:w-[90vw]">
		<h2 class="my-auto grid" id="username">Username: </h2>
		<input class="box" type="text" name="username" required>
		<h2 class="mr-2 my-auto" id="password">Password: </h2>
		<input class="box" type="password" name="password" required> 
		<button class="submit">Login</button>
	</div>
</form>
<p style="color: red" class="w-fit mx-auto">{form?.message ?? ''}</p>
