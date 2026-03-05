-- Add reputation_score and badges columns to users table
-- Fixes schema drift between schema.ts and migrations

ALTER TABLE "users" ADD COLUMN "reputation_score" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "badges" text[];
