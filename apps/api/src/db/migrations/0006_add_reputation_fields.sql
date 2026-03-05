-- Add reputation_score and badges columns to users table
-- Fixes schema drift between schema.ts and migrations
-- Idempotent: safe to run multiple times

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reputation_score" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "badges" text[];

