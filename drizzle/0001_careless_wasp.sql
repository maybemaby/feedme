CREATE TABLE `read_later` (
	`id` integer PRIMARY KEY NOT NULL,
	`item_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`added_at` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `feed_items`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_item_idx` ON `read_later` (`user_id`,`item_id`);