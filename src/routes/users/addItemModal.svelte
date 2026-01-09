<script lang="ts">
	import Password from "$lib/password.svelte";

	// done refactoring add logic
	// init types
    type Department = {
        id: string
        departmentname: string
    }

    type Roles = {
        id: string
        rolename: string
    }

    type FormData = {
        error?: string
    }

    // Props with type annotations
    let { 
        addIsOpen = $bindable<boolean>(),
        form = $bindable<FormData>(),
        departments = $bindable<Department[]>(),
		roles = $bindable<Roles[]>(),
		currentrole,
		user
    } = $props()

	let selected = $state(0)
    let dialog = $state<HTMLDialogElement>()
	let password = $state("")
	// Effect to handle modal open/close
	$effect(() => {
		if (!dialog) return
		
		if (addIsOpen) {
			dialog.showModal()
		} else {
			dialog.close()
		}
    })

    function closeModal() {
		selected = 0
        addIsOpen = false
    }


</script>

<dialog
	bind:this={dialog}
	onclose={() => (addIsOpen = false)}
	onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>
<div class="internal">
	<h2 class="title">Create new user</h2>	
	<!-- Only show error if it's from the add action -->
	{#if form?.error && form?.action === 'add'}
		<p class="error">{form.error}</p>
	{/if}
	<form method="POST" action="?/create" id="form" autocomplete="off">
		<div class="grid grid-cols-3 gap-y-4">
			<input type="hidden" name="id_" value={user.id}>
			<input type="hidden" name="username_" value={user.username}>
			<h2 class="mr-2 my-auto" id="username">Username: <span class="required">*</span></h2>
			<input  class="box"	 type="text" name="username" required>
			<h2 class="mr-2 my-auto" id="departmentid">Department: <span class="required">*</span></h2>
			<select class="box overflow-y-auto"  name="departmentid" id="departmentid" required>
				<option value="" disabled selected>Select an option</option>
				{#each departments as department}
					<option value="{department.id}">{department.departmentname}</option>
				{/each}
			</select>
			<h2 class="mr-2 my-auto" id="roleid">Role: <span class="required">*</span></h2>
			<select class="box overflow-y-auto " name="role" id="role" bind:value={selected} required>
				<option value="0" disabled selected>Select an option</option>
				{#each roles as role}
					<!-- svelte-ignore block_empty -->
					{#if (currentrole == "2" && Number(role.id) == 1)}
					{:else}
						<option value="{role.id}">{role.rolename}</option>
					{/if}
				{/each}
			</select>
			{#if selected == 1 || selected == 2}
			<Password {password}/> 
			<h2 class="mr-2 my-auto" id="passwordhash">Password Retype:  <span class="required">*</span></h2>
			<input  class="box" type="password" name="passwordretype" required> 
			{/if}
			<input type="submit" class="submit" name="" id="">
			<button type="button" onmousedown={closeModal} class="col-span-3">close modal</button>
		</div>
	</form><br>
</div>

</dialog>

