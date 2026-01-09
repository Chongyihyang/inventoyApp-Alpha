CREATE TABLE `stocktake` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`checker` text,
	`time` integer,
	`items` text,
	FOREIGN KEY (`checker`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
