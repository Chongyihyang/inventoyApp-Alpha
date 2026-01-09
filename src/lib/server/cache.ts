import { db } from './db';
import * as table from './db/schema';
import { eq, isNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

class DataCache {
	private cache = new Map<string, CacheEntry<any>>();

	// TTL in milliseconds
	private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
	private readonly LONG_TTL = 10 * 60 * 1000; // 10 minutes

	private isExpired(entry: CacheEntry<any>): boolean {
		return Date.now() - entry.timestamp > entry.ttl;
	}

	private set<T>(key: string, data: T, ttl?: number): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl: ttl || this.DEFAULT_TTL
		});
	}

	private get<T>(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry || this.isExpired(entry)) {
			this.cache.delete(key);
			return null;
		}
		return entry.data;
	}

	public clear(key?: string): void {
		if (key) {
			this.cache.delete(key);
		} else {
			this.cache.clear();
		}
	}

	// Cache methods for different data types
	public async getItems(): Promise<any[]> {
		const cached = this.get<any[]>('items');
		if (cached) return cached;

		const items = await db.select().from(table.itemsTable);
		this.set('items', items, this.DEFAULT_TTL);
		return items;
	}

	public async getUsers(): Promise<any[]> {
		const cached = this.get<any[]>('users');
		if (cached) return cached;

		const users = await db.select().from(table.usersTable);
		this.set('users', users, this.LONG_TTL);
		return users;
	}

	public async getDepartments(): Promise<any[]> {
		const cached = this.get<any[]>('departments');
		if (cached) return cached;

		const departments = await db.select().from(table.departmentTable);
		this.set('departments', departments, this.LONG_TTL);
		return departments;
	}

	public async getTransactions(): Promise<any[]> {
		const cached = this.get<any[]>('transactions');
		if (cached) return cached;

		const usersTable1 = alias(table.usersTable, "usersTable1");
		const usersTable2 = alias(table.usersTable, "usersTable2");
		
		const transactions = await db
			.select({
				id: table.transactionTable.id,
				itemname: table.itemsTable.itemname,
				itemid: table.itemsTable.id,
				outtime: table.transactionTable.outtime,
				issuer: usersTable1.username,
				issuerid: table.transactionTable.issuer,
				issuerdept: usersTable1.departmentid,
				issuee: usersTable2.username,
				issueeid: table.transactionTable.issuee
			})
			.from(table.transactionTable)
			.leftJoin(table.itemsTable, eq(table.transactionTable.itemid, table.itemsTable.id))
			.leftJoin(usersTable1, eq(usersTable1.id, table.transactionTable.issuer))
			.leftJoin(usersTable2, eq(usersTable2.id, table.transactionTable.issuee))
			.where(isNull(table.transactionTable.inttime));

		this.set('transactions', transactions, this.DEFAULT_TTL);
		return transactions;
	}

	// Cache invalidation methods
	public invalidateItems(): void {
		this.clear('items');
		this.clear('transactions'); // Transactions depend on items
	}

	public invalidateUsers(): void {
		this.clear('users');
		this.clear('transactions'); // Transactions depend on users
	}

	public invalidateDepartments(): void {
		this.clear('departments');
	}

	public invalidateTransactions(): void {
		this.clear('transactions');
	}

	public invalidateAll(): void {
		this.clear();
	}
}

export const cache = new DataCache();
