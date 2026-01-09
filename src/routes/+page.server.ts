import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq, isNull, lt } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { requireLogin } from '$lib';
import { toLog } from '$lib/shared.svelte';
import { cache } from '$lib/server/cache';

const DEBUG = false

function debugPrint(x: string, y: unknown) {
	if (DEBUG) {
		console.log(`${x}: \n---------------------`);
		console.log(y);
		console.log("--------END---------");
	}
}

// Retry function for network resilience
async function executeWithRetry<T>(
	operation: () => Promise<T>,
	maxRetries: number = 3,
	delay: number = 1000
): Promise<T> {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			console.error(`Attempt ${attempt} failed:`, error);
			
			if (attempt === maxRetries) {
				throw error;
			}
			
			// Exponential backoff
			await new Promise(resolve => setTimeout(resolve, delay * attempt));
		}
	}
	
	throw new Error('Max retries exceeded');
}

async function cleanupOldTransactions() {
	await db
		.delete(table.transactionTable)
		.where(lt(table.transactionTable.outtime, Date.now() - 2629800000));
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireLogin();

	const [inventoryList, users, departmentList, items] = await Promise.all([
		cache.getItems(),
		cache.getUsers(),
		cache.getDepartments(),
		cache.getTransactions()
	]);

	await cleanupOldTransactions();

	const currentdept = Number(locals.department);
	const currentuser = locals.user;
	const currentrole = locals.role;

	return {
		user,
		items,
		inventoryList,
		departmentList,
		currentdept,
		currentuser,
		users,
		currentrole
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);
		if (toLog.current.values == 1) {
			await db.insert(table.logsTable).values({
				time: Date.now(),
				item: `${event.locals.user?.username} LOGGED OUT`
			})
		}
		return redirect(302, '/login');
	},

	signout: async ({ request }) => {
		try {
			const data = await request.formData();
			const issuee = String(data.get('issuee') ?? '').trim();
			const issuer = String(data.get('issuer') ?? '').trim();
			const HOTO = String(data.get('HOTO') ?? '');

			// Validate inputs first
			if (!issuee || !issuer) {
				return fail(400, {
					error: "Missing required fields",
					action: "signout"
				});
			}

			const users = await cache.getUsers();
			const isValidIssuee = users.some((x: any) => x.id == issuee);

			if (!isValidIssuee) {
				return fail(422, {
					error: "Issuee does not exist",
					action: "signout"
				});
			}

			// Parse items more robustly
			const itemsString = String(data.get('items') ?? '').trim();
			if (!itemsString) {
				return fail(400, {
					error: "No items were scanned",
					action: "signout"
				});
			}

			const uniqueMap = new Set<string>();
			itemsString
				.split(",")
				.forEach((x: string) => { 
					const trimmed = x.trim();
					if (trimmed) uniqueMap.add(trimmed); 
				});

			const items = Array.from(uniqueMap);

			if (items.length === 0) {
				return fail(400, {
					error: "No valid items were scanned",
					action: "signout"
				});
			}

			// Process items with better error handling and retry logic
			if (HOTO !== "none") {
				const user = users.find((x: any) => x.id == issuee);
				const SLOCitem = user?.departmentid ?? null;
				
				const params = HOTO === "temp" 
					? { currentholder: SLOCitem }
					: { currentholder: SLOCitem, originalholder: SLOCitem };

				// Use transaction with retry logic for network resilience
				await executeWithRetry(async () => {
					await db.transaction(async (tx) => {
						await Promise.all(
							items.map(itemid =>
								tx
									.update(table.itemsTable)
									.set(params)
									.where(eq(table.itemsTable.id, Number(itemid)))
							)
						);
					});
				});
			} else {
				// Use single transaction with retry logic
				await executeWithRetry(async () => {
					await db.transaction(async (tx) => {
						await Promise.all(
							items.map(itemid =>
								tx
									.insert(table.transactionTable)
									.values({
										itemid,
										outtime: Date.now(),
										issuer,
										issuee,
									})
							)
						);
					});
				});
			}

			// Invalidate cache after successful operation
			cache.invalidateItems();
			cache.invalidateTransactions();

			return { success: true };
		} catch (error) {
			console.error('Signout error:', error);
			const message = error instanceof Error ? error.message : "Failed to sign out items";
			return fail(500, {
				error: message,
				action: "signout"
			});
		}
	},

	signin: async ({ request }) => {
		try {
			const data = await request.formData();
			const issuer = String(data.get('issuer') ?? '').trim();

			// Validate input
			if (!issuer) {
				return fail(400, {
					error: "Missing issuer information",
					action: "signin"
				});
			}

			// Parse items more robustly
			const itemsString = String(data.get('items') ?? '').trim();
			if (!itemsString) {
				return fail(400, {
					error: "No items were scanned",
					action: "signin"
				});
			}

			const uniqueMap = new Set<string>();
			itemsString
				.split(",")
				.forEach((x: string) => { 
					const trimmed = x.trim();
					if (trimmed) uniqueMap.add(trimmed); 
				});

			const items = Array.from(uniqueMap);

			if (items.length === 0) {
				return fail(400, {
					error: "No valid items were scanned",
					action: "signin"
				});
			}

			// Use transaction with retry logic for network resilience
			await executeWithRetry(async () => {
				await db.transaction(async (tx) => {
					await Promise.all(
						items.map(itemid =>
							tx.update(table.transactionTable)
								.set({
									inttime: Date.now(),
								})
								.where(and(
									eq(table.transactionTable.issuer, String(issuer)),
									eq(table.transactionTable.itemid, String(itemid)),
									isNull(table.transactionTable.inttime)
								))
						)
					);
				});
			});

			// Invalidate cache after successful operation
			cache.invalidateTransactions();

			return { success: true };
		} catch (error) {
			console.error('Signin error:', error);
			const message = error instanceof Error ? error.message : "Failed to sign in items";
			return fail(500, {
				error: message,
				action: "signin"
			});
		}
	}
};
