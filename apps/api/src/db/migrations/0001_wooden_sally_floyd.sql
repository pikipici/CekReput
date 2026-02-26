ALTER TABLE "perpetrators" ADD COLUMN "total_loss" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "loss_amount" integer;