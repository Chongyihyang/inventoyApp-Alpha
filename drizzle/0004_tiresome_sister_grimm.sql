CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`categoryname` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_categoryname_unique` ON `categories` (`categoryname`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`itemname` text NOT NULL,
	`SN1` text,
	`SN2` text,
	`remarks` text,
	`currentholder` integer,
	`originalholder` integer,
	`category` integer,
	`us` integer,
	FOREIGN KEY (`currentholder`) REFERENCES `department`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`originalholder`) REFERENCES `department`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_item`("id", "itemname", "SN1", "SN2", "remarks", "currentholder", "originalholder", "category", "us") SELECT "id", "itemname", "SN1", "SN2", "remarks", "currentholder", "originalholder", "category", "us" FROM `item`;--> statement-breakpoint
DROP TABLE `item`;--> statement-breakpoint
ALTER TABLE `__new_item` RENAME TO `item`;--> statement-breakpoint
PRAGMA foreign_keys=ON;