CREATE TABLE `inventory_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`manufacturer` text NOT NULL,
	`serial` text(12) NOT NULL,
	`status` text NOT NULL,
	`purchaseDate` text NOT NULL,
	`warrantyExpiryDate` text NOT NULL,
	`specifications` text NOT NULL,
	`imageUrl` text NOT NULL,
	`assignmentDate` text,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_item_id_unique` ON `inventory_item` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_item_uuid_unique` ON `inventory_item` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_id_unique` ON `user` (`id`);