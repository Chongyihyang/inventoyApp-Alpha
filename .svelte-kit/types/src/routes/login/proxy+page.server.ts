// @ts-nocheck
import { verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import { lt, eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { validatePassword, validateUsername } from '$lib/utils';
import type { Session } from '$lib/server/db/schema';
import { toLog } from '$lib/shared.svelte';

export const load = async (event: Parameters<PageServerLoad>[0]) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions = {

	login: async (event: import('./$types').RequestEvent) => {
		// Clean up expired sessions
		await db.delete(table.sessionTable).where(lt(table.sessionTable.expiresAt, new Date()));

		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, {
				message: 'Invalid username (min 3, max 31 characters, alphanumeric only)'
			});
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
		}
				const results = await db.select().from(table.usersTable).where(eq(table.usersTable.username, username));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username' });
		}

		if (existingUser.passwordHash == null || existingUser.passwordHash == "") {
			return fail(200, { message: 'Unable to log in user' })
		} else {

			const validPassword = await verify(existingUser.passwordHash, password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			if (!validPassword) {
				return fail(400, { message: 'Incorrect username or password' });
			}

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, existingUser.id);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
			if (toLog.current.values == 1) {
				await db.insert(table.logsTable).values({
					time: Date.now(),
					item: `${username} LOGGED IN`
				})
			}
			return redirect(302, '/');
		}

	}
};;null as any as Actions;