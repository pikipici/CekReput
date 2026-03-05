-- Add database indexes for search performance
-- Fixes P1 issue: Missing indexes on frequently queried columns

-- Perpetrators: Account number, phone number, entity name (search columns)
CREATE INDEX IF NOT EXISTS "perpetrators_account_number_idx" ON "perpetrators" USING btree ("account_number" text_pattern_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "perpetrators_phone_number_idx" ON "perpetrators" USING btree ("phone_number" text_pattern_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "perpetrators_entity_name_idx" ON "perpetrators" USING btree ("entity_name" text_pattern_ops);
--> statement-breakpoint

-- Perpetrators: Threat level and verified reports (filter columns)
CREATE INDEX IF NOT EXISTS "perpetrators_threat_level_idx" ON "perpetrators" USING btree ("threat_level");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "perpetrators_verified_reports_idx" ON "perpetrators" USING btree ("verified_reports");
--> statement-breakpoint

-- Reports: Status and perpetrator ID (join + filter columns)
CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_perpetrator_id_idx" ON "reports" USING btree ("perpetrator_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_reporter_id_idx" ON "reports" USING btree ("reporter_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_incident_date_idx" ON "reports" USING btree ("incident_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_created_at_idx" ON "reports" USING btree ("created_at" DESC);
--> statement-breakpoint

-- Reports: Composite index for common query pattern (perpetrator + status)
CREATE INDEX IF NOT EXISTS "reports_perpetrator_status_idx" ON "reports" USING btree ("perpetrator_id", "status");
--> statement-breakpoint

-- Users: Email and Google ID (lookup columns)
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_google_id_idx" ON "users" USING btree ("google_id");
--> statement-breakpoint

-- Evidence files: Report ID (join column)
CREATE INDEX IF NOT EXISTS "evidence_files_report_id_idx" ON "evidence_files" USING btree ("report_id");
--> statement-breakpoint

-- Comments: Perpetrator ID and user ID (join columns)
CREATE INDEX IF NOT EXISTS "comments_perpetrator_id_idx" ON "comments" USING btree ("perpetrator_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_user_id_idx" ON "comments" USING btree ("user_id");
--> statement-breakpoint

-- Clarifications: Perpetrator ID, requester ID, and status (filter columns)
CREATE INDEX IF NOT EXISTS "clarifications_perpetrator_id_idx" ON "clarifications" USING btree ("perpetrator_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clarifications_status_idx" ON "clarifications" USING btree ("status");
--> statement-breakpoint

-- API Keys: User ID and key hash (lookup columns)
CREATE INDEX IF NOT EXISTS "api_keys_user_id_idx" ON "api_keys" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_keys_key_hash_idx" ON "api_keys" USING btree ("key_hash");
