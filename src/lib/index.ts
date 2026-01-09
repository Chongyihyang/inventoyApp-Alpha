// place files you want to import through the `$lib` alias in this folder.
import { getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';

export function requireLogin() {
	const { locals } = getRequestEvent();

	console.log(locals.user)
	if (!locals.user) {
		return redirect(302, '/login');
	}

	return locals.user;
}