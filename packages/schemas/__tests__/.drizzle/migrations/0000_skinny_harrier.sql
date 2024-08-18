CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255) NOT NULL,
	`translatable` real
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255),
	`age` integer NOT NULL,
	`updated_at` text NOT NULL,
	`created_at` text NOT NULL,
	`company_id` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `companies_id_unique` ON `companies` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `companies_id_idx` ON `companies` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_idx` ON `users` (`id`);--> statement-breakpoint
CREATE INDEX `users_name_idx` ON `users` (`name`);--> statement-breakpoint
CREATE INDEX `users_age_idx` ON `users` (`age`);