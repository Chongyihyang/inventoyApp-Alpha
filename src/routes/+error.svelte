<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let countdown = $state(10);
	let redirectUrl = $state('/');

	// Check if this is a 404 error
	let isNotFound = $derived($page.status === 404);
	let errorTitle = $derived(isNotFound ? 'Page Not Found' : 'Something went wrong');
	let errorCode = $derived(isNotFound ? '404' : $page.status?.toString() || 'Error');

	onMount(() => {
		const timer = setInterval(() => {
			countdown--;
			if (countdown === 0) {
				window.location.href = redirectUrl;
			}
		}, 1000);

		return () => clearInterval(timer);
	});

	function goHome() {
		window.location.href = redirectUrl;
	}

	function goBack() {
		window.history.back();
	}
</script>

<div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
	<div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">


		<!-- Error Message -->
        <br>
		<h1 class="text-6xl font-bold text-gray-850 mb-4">{errorCode}</h1>
		<h2 class="text-2xl font-semibold text-gray-700 mb-2">{errorTitle}</h2>
		<p class="text-gray-600 mb-6">
			{#if isNotFound}
				The page you're looking for doesn't exist or has been moved.
			{:else}
				An unexpected error occurred while processing your request.
			{/if}
		</p>

		<!-- URL Info for 404 -->
		{#if isNotFound}
			<div class="bg-gray-50 rounded-lg p-3 mb-6">
				<p class="text-sm text-gray-500">
					<strong>Requested URL:</strong><br>
					<span class="text-gray-700 font-mono text-xs break-all">{$page.url}</span>
				</p>
			</div>
		{/if}

		<!-- Countdown -->
		<div class="mb-6">
			<p class="text-sm text-gray-600">
				Redirecting to homepage in <span class="font-bold text-blue-600">{countdown}</span> seconds...
			</p>
            <br>
		</div>

		<!-- Action Buttons -->
		<div class="space-y-3">
			<button 
				onclick={goHome}
				class="w-90% bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
			>
				Go to Homepage
			</button>
			
		</div>

	</div>
</div>

<style>
	/* Additional animations */
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}

	div > div {
		animation: fadeIn 0.5s ease-out;
	}

	/* Countdown animation */
	span.font-bold {
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
</style>
