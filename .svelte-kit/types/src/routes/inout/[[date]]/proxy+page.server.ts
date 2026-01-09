// @ts-nocheck
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, desc, eq, gt, lt } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { requireLogin } from '$lib';
import { redirect, type Action } from '@sveltejs/kit';

function dateTest(input: string) {
    const regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/i;
    return regex.test(input);
}

function getYYYYMMDD() {
	const today = new Date()
  
	let dd = String(today.getDate())
	let mm = String(today.getMonth() + 1) // Month is 0-indexed, so add 1
	const yy = today.getFullYear().toString() // Get last two digits of the year
  
	// Add leading zeros if day or month is a single digit
	if (Number(dd) < 10) {
	  dd = '0' + dd;
	}
	if (Number(mm) < 10) {
	  mm = '0' + mm;
	}
  
	return `${yy}-${mm}-${dd}`;
}


function convert(date: string) {
	const [Y, M, D] = date.split("-")
	const d = new Date();
	const offset = d.getTimezoneOffset();
	return Number(Date.UTC(Number(Y), Number(M) - 1, Number(D) + 1)) + offset * 60 * 1000
}


export const load = async ({ locals, params }: Parameters<PageServerLoad>[0]) => {
	const user = requireLogin()
	const usersTable1 = alias(table.usersTable, "usersTable1")
	const setDate = convert(dateTest(params.date) ? params.date : getYYYYMMDD())
	const [lower, upper] = [setDate - 24 * 60 * 60 * 1000, setDate]
    const items = await db
	.select({
		id: table.transactionTable.id,
		itemname: table.itemsTable.itemname,
		itemid: table.itemsTable.id,
		outtime: table.transactionTable.outtime,
		inttime: table.transactionTable.inttime,
		issuer: table.usersTable.username,
		issuerid: table.transactionTable.issuer,
		issuerdept: table.usersTable.departmentid,
		issuee: usersTable1.username,
		issueeid: table.transactionTable.issuee
	})
	.from(table.transactionTable)
	.leftJoin(table.itemsTable, eq(table.transactionTable.itemid, table.itemsTable.id))
	.leftJoin(table.usersTable, eq(table.usersTable.id, table.transactionTable.issuer))
	.leftJoin(usersTable1, eq(usersTable1.id, table.transactionTable.issuee))
	.where(and(lt(table.transactionTable.outtime, upper), 
	gt(table.transactionTable.outtime, lower)))
	.orderBy(desc(table.transactionTable.outtime))


	const departmentList = await db
	.select()
	.from(table.departmentTable)

	const currentdept = Number(locals.department);

	return { user, items, departmentList, currentdept };
};

export const actions = {
	changedate: async ({ request }: import('./$types').RequestEvent) => {
		const data = await request.formData()
		const date = data.get("date")?.toString()
		redirect(302, `/inout/${date}`)
	}
}

// 1753113600000
// 1753196298626
// 1753200000000;null as any as Action;