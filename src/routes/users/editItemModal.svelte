<script lang="ts">
	import Password from "$lib/password.svelte";

	// init types
	type User = {
        id: string
        username: string
        rolename: string
        departmentid: number
	};

    type Roles = {
        id: string
        rolename: string
    }

    type Department = {
        id: string
        departmentname: string
    }

    type FormData = {
        error?: string
    }

	// Props with type annotations
	let { 
		editIsOpen = $bindable<boolean>(),
		form = $bindable<FormData>(),
		currentSelectedList = $bindable<User[]>(),
		departments = $bindable<Department[]>(),
		roles = $bindable<Roles[]>(),
		users = $bindable<User[]>(),
		currentrole,
		user
    } = $props()

    let dialog = $state<HTMLDialogElement>()
	let error = $state<HTMLParagraphElement>()
	let selected = $state(currentSelectedList.roleid)
	let password = $state("")
	
	$effect(() => {
		if (!dialog) return;
	
		if (editIsOpen) {
			dialog.showModal();
			selected = currentSelectedList.roleid
		} else if (editIsOpen == false){
			dialog.close()

		}
	})


	function closeModal() {
		editIsOpen = false
		if (error != null) {
			error.innerHTML = ""
		}
	}
</script>


<dialog
bind:this={dialog}
onclose={() => (editIsOpen = false)}
onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>
	<div class="internal">
		<h2 class="title">Edit properties for {currentSelectedList.username}</h2>
		{#if form?.error && form?.action === 'edit'}
			<p bind:this={error}>{form.error}</p>
		{/if}
		<form method="POST" action="?/edit" id="form" autocomplete="off">
			<div class="grid grid-cols-3 gap-y-4">	
				<input type="hidden" name="id_" value={user.id}>
				<input type="hidden" name="username_" value={user.username}>
				<input  class="box"	type="hidden" name="id" value="{currentSelectedList.id}">
				<h2 class="mr-2 my-auto" id="username">Username:  <span class="required">*</span></h2>
				<input  class="box"	type="text" name="username" value="{currentSelectedList.username}" required>
				<h2 class="mr-2 my-auto" id="departmentid">Department:  <span class="required">*</span></h2>
				<select class="box overflow-y-auto"  name="departmentid" id="departmentid" required>
					{#each departments as department}
						{#if department.id === currentSelectedList.departmentid}
							<option value="{department.id}" selected>{department.departmentname}</option>
						{:else}
							<option value="{department.id}">{department.departmentname}</option>
						{/if}
					{/each}
				</select>
				<h2 class="mr-2 my-auto" id="roleid">Role: <span class="required">*</span></h2>
				<select class="box overflow-y-auto " name="role" id="role" required bind:value={selected}>
				<option value="0" disabled selected>Select an option</option>
				{#each roles as role}
					<!-- svelte-ignore block_empty -->
					{#if (currentrole == "2" && Number(role.id) == 1)}
					{:else}
						<option value="{role.id}">{role.rolename}</option>
					{/if}
				{/each}
				</select> 
				{#if selected == '1' || selected == "2"}
					<Password {password}/>
					<h2 class="mr-2 my-auto" id="passwordhash">Password Retype:  <span class="required">*</span></h2>
					<input  class="box" type="password" name="passwordretype" > 
				{/if}
				<input type="submit" class="submit" name="" id="">
				<button type="button" onmousedown={closeModal} class="col-span-3">close modal</button>
			</div>
		</form><br>
	</div>

</dialog>