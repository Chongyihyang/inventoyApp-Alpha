<script lang="ts">
    let { 
        password = $bindable<String>()
     } = $props();
    import checkPasswordStrength from "check-password-strength"

    const strength = $derived(checkPasswordStrength.passwordStrength(password))
</script>

<style>
	#color-indicators {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		column-gap: 0.2rem;
		width: 100%;
		margin: auto;
	}
	#color-indicators span {
			height: 5px;
	}
	span.valid:nth-child(1) { background-color: red }
	span.valid:nth-child(2) { background-color: orange }
	span.valid:nth-child(3) { background-color: yellow }
	span.valid:nth-child(4) { background-color: green }

</style>


<div class="col-span-3">
	<h2>Requirements for password: </h2>
	<p class="text-[10px]">1. Password is between 8 and 30 characters long</p>
	<p class="text-[10px]">2. Consists of at least 1 upper and lowercase character</p>
	<p class="text-[10px]">3. Contains at least 1 symbol and 1 number</p>
</div>
<h2 class="mr-2 my-auto" id="passwordhash">Password:  <span class="required">*</span></h2>
<input  class="box" type="password" name="passwordhash" bind:value={password}>
<div class="mr-2 my-auto"></div>
<div class="w-full mx-auto col-span-2">
	<div id="color-indicators">
		<span class:valid={strength.id >= 0}></span>
		<span class:valid={strength.id >= 1}></span>
		<span class:valid={strength.id >= 2}></span>
		<span class:valid={strength.id >= 3}></span>
	</div>
</div>