CREATE TABLE `department` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`departmentname` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `department_departmentname_unique` ON `department` (`departmentname`);--> statement-breakpoint
CREATE TABLE `item` (
	`id` text PRIMARY KEY NOT NULL,
	`itemname` text NOT NULL,
	`SN1` text,
	`SN2` text,
	`remarks` text,
	`currentholder` integer,
	`originalholder` integer,
	FOREIGN KEY (`currentholder`) REFERENCES `department`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`originalholder`) REFERENCES `department`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rolename` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `role_rolename_unique` ON `role` (`rolename`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`itemid` text,
	`outtime` integer,
	`inttime` integer,
	`issuer` text,
	`issuee` text,
	FOREIGN KEY (`itemid`) REFERENCES `item`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issuer`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issuee`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`passwordHash` text,
	`roleid` integer NOT NULL,
	`departmentid` integer,
	FOREIGN KEY (`roleid`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`departmentid`) REFERENCES `department`(`id`) ON UPDATE no action ON DELETE no action
);
