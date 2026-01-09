import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireLogin } from '$lib';
import { desc } from 'drizzle-orm';




export async function load() {
    requireLogin()
    
    const stocktake = await getStocktake()

    return { stocktake };
}

// Database query functions
async function getStocktake() {
    return db
        .select({
            name: table.usersTable.username,
            time: table.stocktakeTable.time,
            items:table.stocktakeTable.items
        })
        .from(table.stocktakeTable)
        .leftJoin(table.usersTable, eq(table.stocktakeTable.checker, table.usersTable.id))
        .orderBy(desc(table.stocktakeTable.time))

}


// Action handlers
export const actions = {

};