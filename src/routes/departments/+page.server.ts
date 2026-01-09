import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireLogin } from '$lib';
import { fail } from '@sveltejs/kit';
import { department, toLog } from "$lib/shared.svelte"

 

export async function load({ locals }) {
    const user = requireLogin()
    const departments = await getDepartments()
    const currentdept = Number(department.current.value)
    const currentrole = locals.role

    return { user, departments, currentdept, currentrole };
}

// Database query functions
async function getDepartments() {
    return db
        .select()
        .from(table.departmentTable)
}


// Form validation helpers
function validateDepartmentName(itemname: string | undefined) {
    if (itemname == undefined){
        throw new Error("Item name is undefined")
    }
    if (!itemname.match("^[a-zA-Z0-9]*$")) {
        throw new Error("Item names must be alphanumeric.");
    }
}

function validateDeleteConfirmation(itemname: string, confirmation: string) {
    if (itemname !== confirmation) {
        throw new Error("Incorrect department");
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

        validateDepartmentName(categoryname);

        try {

            if (!id) throw new Error("Missing department ID");
            if (categoryname != categorynameoriginal) {

                await db
                    .update(table.departmentTable)
                    .set({
                        departmentname: categoryname
                    })
                    .where(eq(table.departmentTable.id, Number(id)))
                if (toLog.current.values == 1) {
                    await db.insert(table.logsTable).values({
                        time: Date.now(),
                        item: `${userid} / ${username} EDITED DEPARTMENT NAME: ${categorynameoriginal} =>  ${categoryname}`
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

            validateDepartmentName(categoryname);

            await db.insert(table.departmentTable).values({
                departmentname: categoryname
            });
            if (toLog.current.values == 1) {
                await db.insert(table.logsTable).values({
                    time: Date.now(),
                    item: `${userid} / ${username} ADDED DEPARTMENT: ${categoryname}`
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
            await db.delete(table.departmentTable)
                .where(eq(table.departmentTable.id, Number(id)));
            if (toLog.current.values == 1) {
                await db.insert(table.logsTable).values({
                    time: Date.now(),
                    item: `${userid} / ${username} DELETED DEPARTMENT: ${categoryname}`
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