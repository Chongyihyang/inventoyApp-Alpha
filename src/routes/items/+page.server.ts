import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireLogin } from '$lib';
import { fail } from '@sveltejs/kit';
import { department, toLog } from "$lib/shared.svelte"
import { getAllDepartments, getCategories, getItemsWithDepartments } from '$lib/utils.js';

// Type definitions for better type safety
// type Item = typeof table.itemsTable.$inferSelect;
// type Department = typeof table.departmentTable.$inferSelect;
type ItemInsert = typeof table.itemsTable.$inferInsert;

interface UpdateData {
    [x: string]: unknown,
    itemname: string,
    SN1: string,
    SN2: string,
    remarks: string,
    category: number,
    us: number,
}

type Results = {
    totalItems: number,
    successCount: number,
    errorCount: number,
    successfulItems: object[],
    failedItems: object[],
    details: object[]    
}

export async function load({ locals }) {

    return { 
        user: requireLogin(), 
        currentdept: Number(department.current.value), 
        currentrole: locals.role, 
        items: await getItemsWithDepartments(), 
        departments: await getAllDepartments(), 
        categories: await getCategories(),
    };
}



// Form validation helpers
function validateItemName(itemname: string | undefined) {
    if (itemname == undefined){
        throw new Error("Item name is undefined")
    }
    if (!itemname.match("^[a-zA-Z0-9 \\-]+$")) {
        throw new Error("Item names must be alphanumeric.");
    }
}

function validateDeleteConfirmation(itemname: string, confirmation: string) {
    if (itemname !== confirmation) {
        throw new Error("Incorrect item");
    }

}

async function getDB() {
    const [allItems, allDepartments, allCategories] = await Promise.all([
        getItemsWithDepartments(),
        getAllDepartments(),
        getCategories()
    ]);
    
    const departmentMap = new Map(allDepartments.map(d => [d.departmentname, d.id]));
    const categoryMap = new Map(allCategories.map(c => [c.categoryname, c.id]));
    const sn1Set = new Set(allItems.map(i => {if (i.SN1 != "") {return i.SN1}}).filter(Boolean));
    const sn2Set = new Set(allItems.map(i => {if (i.SN2 != "") {return i.SN2}}).filter(Boolean));   
    return {departmentMap, categoryMap, sn1Set, sn2Set}
}



// Action handlers
export const actions = {

    upload: async ({ request, locals }) => {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userid = formData.get('id_')?.toString()?.trim() ?? '';
        const username = formData.get('username')?.toString()?.trim() ?? '';


        if (!file) {
            return fail(400, { error: 'No file provided' });
        }

        const content = await file.text()
        const rows = content.split(/\r?\n/).filter(row => row.trim() !== '');
        const params: ItemInsert[] = []
        const results: Results = {
            totalItems: 0,
            successCount: 0,
            errorCount: 0,
            successfulItems: [],
            failedItems: [],
            details: []
        };

        const {departmentMap, categoryMap, sn1Set, sn2Set} = await getDB()

        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        const itemIdsList = [];
        for (let i = 0; i < rows.length; i++) {
            console.time(`start${i}`)
            const row = rows[i];
            const rowNumber = i + 1;
            const columns = row.split(',');
            
            if (i === 0) continue; // Skip header
            results.totalItems++;
            let isValid = true;
            const messages = [];
            if (columns.length != 7) {
                isValid = false
                messages.push("Row does not have 7 columns")
                continue
            } 
            
            // check itemId
            const itemid = columns[0] ? columns[0].trim() : '';
            if (!itemid) {
                isValid = false;
                messages.push("Missing item ID");
            } 
    
            const SN1 = columns[1] ? columns[1].trim() : '';
            if (sn1Set.has(SN1)) {
                isValid = false;
                messages.push("SN1 is not unique");
            } else if (SN1 != "") {
                sn1Set.add(SN1)
            }
    
            //check SN2
            const SN2 = columns[2] ? columns[2].trim() : '';
             if (!/^[0-9]*$/.test(SN2)  ) {
                isValid = false;
                messages.push("SN2 contains characters other than numerals");
            } else if (sn2Set.has(SN2) && SN2 != "") {
                isValid = false;
                messages.push("SN2 is not unique");
            } else if (SN2 != "") {
                sn2Set.add(SN2)
            }
    
            const currentholdertmp = columns[3] ? columns[3].trim() : '';
            let currentholder = 0
             if (!alphanumericRegex.test(currentholdertmp)) {
                isValid = false;
                messages.push("currentholder contains characters other than numerals");
            } else if (!departmentMap.has(currentholdertmp)) {
                isValid = false
                messages.push("Cannot find department for current holder")
            } else if (locals.role == "2" && locals.department != currentholdertmp){
                isValid = false
                messages.push("current holder is not user's sqn")
            } else {
                currentholder = departmentMap.get(currentholdertmp) ?? 0
            }
    
            const originalholdertmp = columns[4] ? columns[4].trim() : '';
            let originalholder = 0
             if (!alphanumericRegex.test(originalholdertmp)) {
                isValid = false;
                messages.push("originalholder contains characters other than numerals");
            } else if (!departmentMap.has(originalholdertmp)) {
                isValid = false
                messages.push("Cannot find department for original holder")
            } else {
                originalholder = departmentMap.get(originalholdertmp) ?? 0
            }
    
            const remarks = columns[5] ? columns[5].trim() : '';

            let category = 0
            const categoryString = columns[6] ? columns[6].trim() : '';
            if (!categoryMap.has(categoryString) && categoryString != "") {
                isValid = false;
                messages.push("category name is not in the categorylist");
            } else {
                category = categoryMap.get(categoryString) ?? 0
            }

            const itemResult = {
                row: rowNumber,
                itemid,
                status: isValid ? "Success" : "Failed",
                SN1,
                SN2,
                remarks,
                messages: messages.join(", ")
            }

            if (isValid) {
                const us = 0
                const toFunc: ItemInsert = {
                    itemname: itemid,
                    SN1,
                    SN2,
                    remarks,
                    currentholder,
                    originalholder,
                    category,
                    us
                }
                params.push(toFunc)
                results.successCount++;
                results.successfulItems.push(itemResult);
                itemIdsList.push(itemid);
            } else {
                results.errorCount++;
                results.failedItems.push(itemResult);
            }
            results.details.push(itemResult)
            console.timeEnd(`start${i}`)
        }
        try {
            if (params.length != 0) {
                await db.transaction(async (tx) => {
                    await tx.insert(table.itemsTable).values(params)
                });
                if (toLog.current.values == 1) {
                    await db.insert(table.logsTable).values({
                        time: Date.now(),
                        item: `${userid} / ${username} UPLOADED: ${JSON.stringify(params)}`
                    })
                }
            }
            return { success: true, results };
        } catch (error) {
            return fail(500, { error: error instanceof Error ? error.message : "Failed to create item" })
        }
    },

    edit: async ({ request }) => {
        const data = await request.formData()   
        const userid = data.get('id_')?.toString()?.trim() ?? ''
        const username = data.get('username')?.toString()?.trim() ?? ''
        const id = Number(data.get("id")?.toString())
        const SN1_og = data.get('SN1_og')?.toString() ?? ""
        const SN2_og = data.get('SN2_og')?.toString() ?? ""
        const updateData: UpdateData = {
            itemname: data.get('itemname')?.toString() ?? "",
            SN1: data.get('SN1')?.toString() ?? "",
            SN2: data.get('SN2')?.toString() ?? "",
            remarks: data.get('remarks')?.toString() ?? "",
            category: Number(data.get('category')?.toString() ?? ""),
            us: Number(data.get('us')?.toString() ?? "0"),
        }   

        const {sn1Set, sn2Set} = await getDB()   

        try {


            if (sn1Set.has(updateData.SN1) && updateData.SN1 != SN1_og) {
                throw new Error("SN1 is not unique")
            } else {
                sn1Set.add(updateData.SN1)
            }
    

            if (!/^[0-9]*$/.test(updateData.SN2)) {
                throw new Error("SN2 contains characters other than numerals")
            } else if (sn2Set.has(updateData.SN2) && updateData.SN2 != "" && updateData.SN2 != SN2_og) {
                throw new Error("SN2 is not unique")
            } else {
                sn2Set.add(updateData.SN2)
            }

            validateItemName(String(updateData.itemname));
            if (!id) throw new Error("Missing item ID");

            await db
                .update(table.itemsTable)
                .set(updateData)
                .where(eq(table.itemsTable.id, id));
            if (toLog.current.values == 1) {
                await db.insert(table.logsTable).values({
                    time: Date.now(),
                    item: `${userid} / ${username} EDITED: ${JSON.stringify((await getItemsWithDepartments()).filter(x => x.id == id))} => ${JSON.stringify(updateData)}`
                })
            }
            return { success: true };
        } catch (error) {
            updateData.id = data.get("id")?.toString() ?? ""
            return { error: error instanceof Error ? error.message : "Failed to update item",
                     action: "edit", 
                     updateData
             };
        }
    },

    create: async ({ request }) => {
        
        try {
            const data = await request.formData();
            const userid = data.get('id_')?.toString()?.trim() ?? '';
            const username = data.get('username')?.toString()?.trim() ?? '';
            const itemname = data.get('itemname')?.toString()?.trim() ?? '';
            const SN1 = data.get('SN1')?.toString(); 
            const SN2 = data.get('SN2')?.toString();
            const remarks = data.get('remarks')?.toString();
            const currentholder = data.get('currentholder')?.toString();
            const category = Number(data.get('category')?.toString() ?? "");
            const us = Number(data.get('us')?.toString() ?? "0");
            if (currentholder == null) {
                throw new Error("currentholder cannot be null")
            } 
            let originalholder = data.get('originalholder')?.toString();
            if (originalholder == null) {
                throw new Error("originalholder cannot be null")
            } 

            validateItemName(itemname);

            if (!originalholder) {
                originalholder = currentholder;
            }

            if ((await getItemsWithDepartments()).filter(x => 
                x.SN1 == SN1)
                .length != 0) {
                    throw new Error("SN1 is not unique")
            }

            if ((await getItemsWithDepartments()).filter(x => 
                x.SN2 == SN2)
                .length != 0) {
                    throw new Error("SN2 is not unique")
            }

            const item: ItemInsert = {
                itemname,
                SN1,
                SN2,
                currentholder: Number(currentholder),
                originalholder: Number(originalholder),
                remarks,
                category,
                us
            };

            await db.insert(table.itemsTable).values(item);
            if (toLog.current.values == 1) {
                await db.insert(table.logsTable).values({
                    time: Date.now(),
                    item: `${userid} / ${username} ADDED: ${JSON.stringify(item)}`
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
            const SN1 = data.get('SN1')?.toString()?.trim();
            const SN2 = data.get('SN2')?.toString()?.trim();
            const itemname = data.get('itemname')?.toString()?.trim();
            const confirmation = data.get('confirmation')?.toString()?.trim();
    
            if (!id || !itemname || !confirmation) {
                throw new Error("Missing required fields");
            }
    
            validateDeleteConfirmation(itemname, confirmation);
            await db.delete(table.itemsTable)
                .where(eq(table.itemsTable.id, Number(id)));
            if (toLog.current.values == 1) {
                await db.insert(table.logsTable).values({
                    time: Date.now(),
                    item: `${userid} / ${username} DELETED ${id}: ${itemname} / ${SN1} / ${SN2}`
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