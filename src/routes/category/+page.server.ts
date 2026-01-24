import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireLogin } from '$lib';
import { fail } from '@sveltejs/kit';
import { department, toLog } from "$lib/shared.svelte"
import { getItemsWithDepartments } from '$lib/utils.js';
import { cache } from '$lib/server/cache';

// Type definitions for better type safety
// type Item = typeof table.itemsTable.$inferSelect;
// type Department = typeof table.departmentTable.$inferSelect;
// type CategoryInsert = typeof table.categoriestable.$inferInsert;
// type Param = {
//     id: string,
//     itemname: string,
//     SN1: string,
//     SN2: string,
//     remarks: string,
//     currentholder: number,
//     originalholder: number
// }
// interface UpdateData {
//     [id: string]: string
// }


export async function load({ locals }) {
    const user = requireLogin()
    const items = await getItemsWithDepartments()
    const categories = await getCategories()
    const currentdept = Number(department.current.value)
    const currentrole = locals.role

    return { user, categories, currentdept, currentrole, items };
}

// Database query functions
async function getCategories() {
    return db
        .select({
            id: table.categoriestable.id,
            categoryname: table.categoriestable.categoryname
        })
        .from(table.categoriestable)
}


// Form validation helpers
function validateItemName(itemname: string | undefined) {
    if (itemname == undefined){
        throw new Error("Item name is undefined")
    }
    if (!itemname.match("^[a-zA-Z0-9]*$")) {
        throw new Error("Item names must be alphanumeric.");
    }
}

function validateDeleteConfirmation(itemname: string, confirmation: string) {
    if (itemname !== confirmation) {
        throw new Error("Incorrect item");
    }
}

// Action handlers
export const actions = {

    edit: async ({ request }) => {
        const data = await request.formData()
        const id = data.get('id')?.toString()?.trim() ?? ''
        const userid = data.get('id_')?.toString()?.trim() ?? ''
        const username = data.get('username')?.toString()?.trim() ?? ''
        const categoryname = data.get('categoryname')?.toString()?.trim() ?? ''
        const categorynameoriginal = data.get('categorynameoriginal')?.toString()?.trim() ?? ''

        validateItemName(categoryname);

        try {

            if (!id) throw new Error("Missing category ID");
            if (categoryname != categorynameoriginal) {

                await db
                    .update(table.categoriestable)
                    .set({
                        categoryname
                    })
                    .where(eq(table.categoriestable.id, Number(id)))
                cache.invalidateItems();
                if (toLog.current.values == 1) {
                    await db.insert(table.logsTable).values({
                        time: Date.now(),
                        item: `${userid} / ${username} EDITED CATEGORIES: ${categorynameoriginal} =>  ${categoryname}`
                    })
                }
            }
            return { success: true };
        } catch (error) {
            return { error: error instanceof Error ? error.message : "Failed to update category",
                     action: "edit",
                     updateData: categoryname
             };
        }
    },

    create: async ({ request }) => {
        
        try {
            const data = await request.formData()
            const userid = data.get('id_')?.toString()?.trim() ?? ''
            const username = data.get('username')?.toString()?.trim() ?? ''
            const categoryname = data.get('categoryname')?.toString()?.trim() ?? ''

            validateItemName(categoryname);

            await db.insert(table.categoriestable).values({
                categoryname
            });
            cache.invalidateItems();
            if (toLog.current.values == 1) {
                await db.insert(table.logsTable).values({
                    time: Date.now(),
                    item: `${userid} / ${username} ADDED CATEGORY: ${categoryname}`
                })
            }
            return { success: true };

        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create item";
            return fail(422, {
                error: message,
                action: "add"
            });
        }
    },

    delete: async ({ request }) => {
        try {
            const data = await request.formData();
            
            const userid = data.get('id_')?.toString()?.trim() ?? '';
            const username = data.get('username')?.toString()?.trim() ?? '';
            const id = data.get('id')?.toString()?.trim();
            const categoryname = data.get('categoryname')?.toString()?.trim();
            const confirmation = data.get('confirmation')?.toString()?.trim();
    
            if (!id || !categoryname || !confirmation) {
                throw new Error("Missing required fields");
            }
    
            validateDeleteConfirmation(categoryname, confirmation);
            await db.delete(table.categoriestable)
                .where(eq(table.categoriestable.id, Number(id)));
            cache.invalidateItems();
            if (toLog.current.values == 1) {
                await db.insert(table.logsTable).values({
                    time: Date.now(),
                    item: `${userid} / ${username} DELETED CATEGORY: ${categoryname}`
                })
            }
            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete item";
            return fail(422, {
                error: message,
                action: "delete"
            });
        }
    },
};