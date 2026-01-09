import { encodeBase32LowerCase } from '@oslojs/encoding'
import { db } from './server/db'
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema'


export type User = {
	id: string,
	username: string
}

export async function getCategories() {
    return db
        .select()
        .from(table.categoriestable)
}

export async function getItemsWithDepartments() {
    return db
        .select({
            id: table.itemsTable.id,
            itemname: table.itemsTable.itemname,
            SN1: table.itemsTable.SN1,
            SN2: table.itemsTable.SN2,
            remarks: table.itemsTable.remarks,
            originalholder: table.departmentTable.departmentname,
            currentholder: table.itemsTable.currentholder,
            category: table.itemsTable.category,
            us: table.itemsTable.us			
		})
        .from(table.itemsTable)
        .leftJoin(
            table.departmentTable, 
            eq(table.departmentTable.id, table.itemsTable.originalholder)
        )
        .orderBy(table.itemsTable.category, table.itemsTable.itemname)
}

export async function getAllDepartments() {
    return db.select().from(table.departmentTable).orderBy(table.departmentTable.departmentname);
}


export function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

export function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[A-Z0-9_-]+$/.test(username)
	);
}

export function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,30}$/.test(password)
}

export function validateUniqueness(SN1: string, SN2: string) {
	
}