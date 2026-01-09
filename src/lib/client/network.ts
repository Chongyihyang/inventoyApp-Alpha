// Client-side network resilience utilities
export class NetworkResilience {
	private static isSubmitting = false;

	static async submitForm(form: HTMLFormElement, maxRetries: number = 2): Promise<boolean> {
		if (this.isSubmitting) {
			console.warn('Form already submitting, preventing duplicate submission');
			return false;
		}

		this.isSubmitting = true;
		const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
		const originalText = submitButton?.textContent;

		try {
			// Disable submit button and show loading state
			if (submitButton) {
				submitButton.disabled = true;
				submitButton.textContent = 'Submitting...';
			}

			for (let attempt = 1; attempt <= maxRetries; attempt++) {
				try {
					const formData = new FormData(form);
					const response = await fetch(form.action, {
						method: 'POST',
						body: formData,
						headers: {
							'Accept': 'application/json',
						},
					});

					if (response.ok) {
						// Success - redirect or reload
						window.location.reload();
						return true;
					} else {
						const errorData = await response.json();
						console.error(`Attempt ${attempt} failed:`, errorData);
						
						if (attempt === maxRetries) {
							// Show error to user
							this.showError(errorData.error || 'Submission failed');
							return false;
						}
						
						// Wait before retry
						await this.delay(1000 * attempt);
					}
				} catch (error) {
					console.error(`Network error on attempt ${attempt}:`, error);
					
					if (attempt === maxRetries) {
						this.showError('Network error. Please check your connection and try again.');
						return false;
					}
					
					await this.delay(1000 * attempt);
				}
			}
		} finally {
			// Reset button state
			this.isSubmitting = false;
			if (submitButton) {
				submitButton.disabled = false;
				submitButton.textContent = originalText;
			}
		}

		return false;
	}

	private static showError(message: string): void {
		// Remove existing error messages
		const existingErrors = document.querySelectorAll('.network-error');
		existingErrors.forEach(error => error.remove());

		// Create and show new error message
		const errorDiv = document.createElement('div');
		errorDiv.className = 'network-error bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
		errorDiv.textContent = message;
		
		const form = document.querySelector('form');
		if (form) {
			form.insertBefore(errorDiv, form.firstChild);
			
			// Auto-remove after 5 seconds
			setTimeout(() => {
				errorDiv.remove();
			}, 5000);
		}
	}

	private static delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

// Enhanced form submission handler
export function enhanceFormSubmission(form: HTMLFormElement): void {
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		await NetworkResilience.submitForm(form);
	});
}
