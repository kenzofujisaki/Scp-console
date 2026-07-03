CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`merchant_id` text NOT NULL,
	`actor` text NOT NULL,
	`requested_scopes` text NOT NULL,
	`data_types_returned` text NOT NULL,
	`status` text NOT NULL,
	`latency_ms` integer,
	`occurred_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `merchants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`scp_endpoint_url` text NOT NULL,
	`is_reference` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `policy_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`merchant_id` text NOT NULL,
	`data_type` text NOT NULL,
	`from_state` integer NOT NULL,
	`to_state` integer NOT NULL,
	`changed_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `scope_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`merchant_id` text NOT NULL,
	`data_type` text NOT NULL,
	`exposed` integer DEFAULT true NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `test_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`merchant_id` text NOT NULL,
	`shopper_id` text NOT NULL,
	`requested_scopes` text NOT NULL,
	`filtered_scopes` text NOT NULL,
	`response_status` integer NOT NULL,
	`latency_ms` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON UPDATE no action ON DELETE cascade
);
