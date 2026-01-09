import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, desc, gt, lt } from 'drizzle-orm';
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


export const load: PageServerLoad = async ({ params, locals }) => {
	const user = requireLogin()
	if (Number(locals.role) != 1) {
		redirect(302, '/')
	}
	const setDate = convert((dateTest(params.date ?? "") ? params.date : getYYYYMMDD()) ?? "")
	const [lower, upper] = [setDate - 24 * 60 * 60 * 1000, setDate]
    const items = await db
	.select({
		time: table.logsTable.time,
		item: table.logsTable.item,
	})
	.from(table.logsTable)
	.where(and(lt(table.logsTable.time, upper), 
	gt(table.logsTable.time, lower)))
	.orderBy(desc(table.logsTable.time))


	return { user, items };
};

export const actions: Action = {
	changedate: async ({ request }) => {
		const data = await request.formData()
		const date = data.get("date")?.toString()
		redirect(302, `/logs/${date}`)
	}
}
