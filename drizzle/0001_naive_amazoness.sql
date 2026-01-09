PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`passwordHash` text,
	`roleid` integer NOT NULL,
	`departmentid` integer NOT NULL,
	`email` text,
	FOREIGN KEY (`roleid`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`departmentid`) REFERENCES `department`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "username", "passwordHash", "roleid", "departmentid", "email") SELECT "id", "username", "passwordHash", "roleid", "departmentid", "email" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);