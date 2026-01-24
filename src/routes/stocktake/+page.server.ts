import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireLogin } from '$lib';




export async function load({ locals }) {
    const user = requireLogin().id
    
    const items = await getItemsWithDepartments()
    const departments = await getAllDepartments()
    const currentdept = Number(locals.department)
    const currentrole = locals.role

    return { items, departments, currentdept, currentrole, user };
}

// Database query functions
async function getItemsWithDepartments() {
    return db
        .select({
            id: table.itemsTable.id,
            itemname: table.itemsTable.itemname,
            SN1: table.itemsTable.SN1,
            SN2: table.itemsTable.SN2,
            remarks: table.itemsTable.remarks,
            originalholder: table.itemsTable.originalholder,
            currentholder: table.itemsTable.currentholder,
        })
        .from(table.itemsTable)
        .leftJoin(
            table.departmentTable, 
            eq(table.departmentTable.id, table.itemsTable.originalholder)
        )
        .orderBy(table.itemsTable.category)
}

async function getAllDepartments() {
    return db.select().from(table.departmentTable).orderBy(table.departmentTable.departmentname);
}


// Action handlers
export const actions = {
    submit: async ({ request }) => {
        const formData = await request.formData();
        const items = formData.get("items")?.toString() ?? ""
        const checker = formData.get("user")?.toString() ?? ""
        await db
        .insert(table.stocktakeTable)
        .values({
            checker,
            items,
            time: Date.now()
        })
        
        // Return success response to trigger form reset
        return { success: true }
    }
};