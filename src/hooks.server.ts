import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { departmentTable, rolesTable, usersTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event)
	}

	if (user) {
		const department = await db
		.select({
			username: usersTable.username,
			departmentname: departmentTable.departmentname,
			departmentid: departmentTable.id
		})
		.from(departmentTable)
		.leftJoin(usersTable, eq(usersTable.departmentid, departmentTable.id))
		.where(eq(usersTable.username, user?.username))
	
		const role = await db
		.select({
			roleid: rolesTable.id
		})
		.from(rolesTable)
		.leftJoin(usersTable, eq(usersTable.roleid, rolesTable.id))
		.where(eq(usersTable.username, user?.username))
		
		event.locals.user = user
		event.locals.session = session
		event.locals.department = department.length > 0 ? String(department[0].departmentid) : ""
		event.locals.role = role.length > 0 ? String(role[0].roleid) : ""
	}

	console.time("start")
	const response = await resolve(event)
	console.timeEnd("start")
	return response;
};

export const handle: Handle = handleAuth;
