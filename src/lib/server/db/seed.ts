import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '$lib/server/db/schema';
import { createClient } from '@libsql/client';
import { encodeBase32LowerCase } from '@oslojs/encoding';

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

async function main() {
  const client = createClient({
      url: "file:local.db",
  });

  const db = drizzle(client, { schema });


  let roles: typeof schema.rolesTable.$inferInsert = {
    rolename: "SUPERADMIN"
  };
  await db.insert(schema.rolesTable).values(roles);
  roles = {rolename: "ADMIN"};
  await db.insert(schema.rolesTable).values(roles);
  roles = {rolename: "USER"};
  await db.insert(schema.rolesTable).values(roles);
  console.log('New roles created!')


  let departments: typeof schema.departmentTable.$inferInsert = {
    departmentname: "140"
  };
  await db.insert(schema.departmentTable).values(departments);
  departments = {departmentname: "143"};
  await db.insert(schema.departmentTable).values(departments);
  departments = {departmentname: "145"};
  await db.insert(schema.departmentTable).values(departments);
  console.log('New departments created!')


  const item: typeof schema.itemsTable.$inferInsert = {
    id: generateUserId(),
    itemname: "RMC09",
    SN1: "423432423",
    SN2: "12124345",
    currentholder: 1,
    originalholder: 1
  };
  await db.insert(schema.itemsTable).values(item);
  console.log('New item created!')


  const user: typeof schema.usersTable.$inferInsert = {
    id: generateUserId(),
    username: "COMRADE",
    passwordHash: "$argon2id$v=19$m=19456,t=2,p=1$vgZYsPb7mVt2UBFveXph4w$LU6z41R/zZEgbSIdXUCQA3+Maqblf4Fq03NGOixuvVw",
    roleid: 1,
    departmentid: 1,
  };
  await db.insert(schema.usersTable).values(user);
  console.log('New user created!')
}

main();
