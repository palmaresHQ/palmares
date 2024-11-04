CREATE TABLE `profile_type` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` ADD `profile_type_id` integer REFERENCES profile_type(id);--> statement-breakpoint
CREATE UNIQUE INDEX `profile_type_id_unique` ON `profile_type` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `profile_type_id_idx` ON `profile_type` (`id`);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/
