ALTER TABLE "articles" ADD COLUMN "slug" varchar(255);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "category" varchar(120);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_slug_unique" UNIQUE("slug");