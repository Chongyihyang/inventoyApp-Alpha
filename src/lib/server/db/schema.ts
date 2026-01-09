import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const rolesTable = sqliteTable("role", {
	id: int().primaryKey({ autoIncrement: true }),
	rolename: text().unique(),
});

export type Role = typeof rolesTable.$inferSelect;

export const departmentTable = sqliteTable("department", {
	id: int().primaryKey({ autoIncrement: true }),
	departmentname: text().unique(),  
})

export type Department = typeof departmentTable.$inferSelect;

export const usersTable = sqliteTable("user", {
	id: text().primaryKey(),
	username: text().unique().notNull(),
	passwordHash: text(),
	roleid: int().notNull().references(() => rolesTable.id),
	departmentid: int().notNull().references(() => departmentTable.id),
	email: text(),
});

export type User = typeof usersTable.$inferSelect;

export const itemsTable = sqliteTable("item", {
	id: int().primaryKey({ autoIncrement: true}),
	itemname: text().notNull(),
	SN1: text(),
	SN2: text(),
	remarks: text(),
	currentholder: int().references(() => departmentTable.id),
	originalholder: int().references(() => departmentTable.id),  
	category: int().references(() => categoriestable.id),
	us: int()
});

export type Item = typeof itemsTable.$inferSelect;

export const transactionTable = sqliteTable("transactions", {
	id: int().primaryKey({ autoIncrement: true }),
	itemid: text().references(() => itemsTable.id),
	outtime: int(),
	inttime: int(),
	issuer: text().references(() => usersTable.id),
	issuee: text().references(() => usersTable.id),
})

export type Transactions = typeof transactionTable.$inferSelect;

export const sessionTable = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),
	expiresAt: int('expires_at', { mode: 'timestamp' }).notNull().$onUpdateFn(() => new Date()).$type<Date>()
});

export type Session = typeof sessionTable.$inferSelect

export const stocktakeTable = sqliteTable("stocktake", {
	id: int().primaryKey({ autoIncrement: true}),
	checker: text().references(() => usersTable.id),
	time: int(),
	items: text(),
})

export type Stocktake = typeof stocktakeTable.$inferSelect

export const logsTable = sqliteTable("logs", {
	time: int(),
	item: text()
})

export type Logs = typeof logsTable.$inferSelect

export const categoriestable = sqliteTable("categories", {
	id: int().primaryKey({ autoIncrement: true}),
	categoryname: text().unique().notNull()
})

export type Categories = typeof categoriestable.$inferSelect