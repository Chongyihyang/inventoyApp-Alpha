import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';
import { requireLogin } from '$lib';
import { fail } from '@sveltejs/kit';
import { hash } from '@node-rs/argon2';
import { generateUserId, validatePassword, validateUsername } from '$lib/utils';
import { toLog } from "$lib/shared.svelte";
import { cache } from '$lib/server/cache';

// Type definitions for better type safety
type UserInsert = typeof table.usersTable.$inferInsert;

export async function load({ locals }) {

    return { 
        user: requireLogin(), 
        users: await getUsersWithDepartments(), 
        departments: await getAllDepartments(), 
        currentdept: Number(locals.department), 
        roles: await getAllRoles(), 
        currentrole: locals.role, 
    };
}



// Database query functions
async function getUsersWithDepartments() {
    return db
        .select({
            id: table.usersTable.id,
            username: table.usersTable.username,
            rolename: table.rolesTable.rolename,
            roleid: table.usersTable.roleid,
            departmentid: table.usersTable.departmentid
        })
        .from(table.usersTable)
        .leftJoin(
            table.departmentTable, 
            eq(table.departmentTable.id, table.usersTable.departmentid)
        )
        .leftJoin(
            table.rolesTable,
            eq(table.rolesTable.id, table.usersTable.roleid)
        )
        .orderBy(asc(table.usersTable.username));
}

async function getAllDepartments() {
    return db.select().from(table.departmentTable).orderBy(table.departmentTable.departmentname);
}

async function getAllRoles() {
    return db.select().from(table.rolesTable).orderBy(table.rolesTable.id);
}


function validateDeleteConfirmation(username: string, confirmation: string) {
    if (username !== confirmation) {
        throw new Error("Incorrect username");
    }
}


// Action handlers
export const actions = {

    edit: async (event) => {
        const formData = await event.request.formData();
        const id = formData.get('id')?.toString()?.trim() ?? '';
        const username = formData.get('username')?.toString()?.trim() ?? '';
        let passwordHash = formData.get('passwordhash')?.toString()?.trim();
        const passwordRetype = formData.get('passwordretype')?.toString()?.trim()
        const userid = formData.get('id_')?.toString()?.trim() ?? ''
        const username_ = formData.get('username_')?.toString()?.trim() ?? ''
        const updateData: {[id: string]: string | null | number} = {username}

        
        const roleid = formData.get('role')?.toString()?.trim();
        if (roleid != undefined) {
            updateData["roleid"] = Number(roleid)
        }
        const departmentid = formData.get('departmentid')?.toString()?.trim();
        if (departmentid != undefined) {
            updateData["departmentid"] = Number(departmentid)
        }
        
        try {
            if (!validateUsername(username)) {
                throw new Error("Username must be alphanumeric")
            }
            if (passwordHash != passwordRetype) {
                throw new Error("Passwords do not match")
            }
            
            if (toLog.current.values == 1) {
                await db.insert(table.logsTable).values({
                    time: Date.now(),
                    item: `${userid} / ${username_} EDITED USER: ${JSON.stringify((await getUsersWithDepartments()).filter(x => x.id == id))} => ${JSON.stringify(updateData)}`
                })
            }

            if (passwordHash != "" && passwordHash != undefined) {
                updateData["passwordHash"] = passwordHash
                if (!validatePassword(passwordHash) && roleid != "3") {
                    return fail(400, { message: 'Password does not meet complexity requirements' });
                }
            }


            if ((roleid == "1" || roleid == "2") && passwordHash != "" && passwordHash != undefined) {
                passwordHash = await hash(passwordHash ?? "", {
                    // recommended minimum parameters
                    memoryCost: 19456,
                    timeCost: 2,
                    outputLen: 32,
                    parallelism: 1
                });
                updateData["passwordHash"] = passwordHash
            } else if (roleid == "3") {
                updateData["passwordHash"] = null
            }

            await db
                .update(table.usersTable)
                .set(updateData)
                .where(eq(table.usersTable.id, id));

            cache.invalidateUsers();
            return { success: true };
        } catch (error) {
            updateData["id"] = id
            return { error: error instanceof Error ? error.message : "Failed to update item",
                     action: "edit", 
                     updateData
             };
        }
    },

    create: async (event) => {
        try {
            const formData = await event.request.formData()
            const username = formData.get('username')?.toString()?.trim() ?? ''
            let passwordHash = formData.get('passwordhash')?.toString()?.trim()
            const passwordRetype = formData.get('passwordretype')?.toString()?.trim()
            const userid = formData.get('id_')?.toString()?.trim() ?? ''
            const username_ = formData.get('username_')?.toString()?.trim() ?? ''

            // double entry check
            if (passwordHash != passwordRetype) {
                throw new Error("Passwords do not match")
            }

            if (passwordHash == undefined) {
                passwordHash = ""
            }

            if (!validateUsername(username)) {
                throw new Error("Username must be alphanumeric")
            }
            const roleid = Number(formData.get('role')) || 0
            const departmentid = Number(formData.get('departmentid')) || 0

            if (roleid == 0) {
                throw new Error("Role cannot be null")
            } 

            if (departmentid == 0) {
                throw new Error("Department cannot be null")
            } 
            let user: UserInsert

            if (roleid == 3) {
                user = {
                    id: generateUserId(),
                    username,
                    roleid,
                    departmentid
                };
            } else {
                if (!validatePassword(passwordHash) && passwordHash != "") {
                    throw new Error('Password does not meet complexity requirements')
                }
    
                passwordHash = await hash(passwordHash, {
                    // recommended minimum parameters
                    memoryCost: 19456,
                    timeCost: 2,
                    outputLen: 32,
                    parallelism: 1
                });
    
                user = {
                    id: generateUserId(),
                    username,
                    roleid,
                    departmentid,
                    passwordHash,
                };
            }
            

            await db.insert(table.usersTable).values(user)
            cache.invalidateUsers();
            if (toLog.current.values == 1) {
                await db.insert(table.logsTable).values({
                    time: Date.now(),
                    item: `${userid} / ${username_} CREATED USER: ${username}`
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
        const data = await request.formData();
        
        try {
            const id = data.get('id')?.toString()?.trim()
            const username = data.get('username')?.toString()?.trim()
            const confirmation = data.get('confirmation')?.toString()?.trim()
            const userid = data.get('id_')?.toString()?.trim() ?? ''
            const username_ = data.get('username_')?.toString()?.trim() ?? ''

            if (!id || !username || !confirmation) {
                throw new Error("Missing required fields");
            }

            validateDeleteConfirmation(username, confirmation);

            await db.delete(table.usersTable)
            .where(eq(table.usersTable.id, id));
            cache.invalidateUsers();
            if (toLog.current.values == 1) {
                await db.insert(table.logsTable).values({
                    time: Date.now(),
                    item: `${userid} / ${username_} DELETED USER: ${id} / ${username}`
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