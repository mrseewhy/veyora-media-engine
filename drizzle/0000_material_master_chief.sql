CREATE TABLE "episodes" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"journey_template" text NOT NULL,
	"storyboard_path" text NOT NULL,
	"storyboard_version" integer NOT NULL,
	"lifecycle_status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "episodes_storyboard_version_positive" CHECK ("episodes"."storyboard_version" > 0)
);
--> statement-breakpoint
CREATE TABLE "evaluation_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"render_version_id" uuid NOT NULL,
	"evaluator" text NOT NULL,
	"evaluator_type" text NOT NULL,
	"model_version" text,
	"criteria_version" text DEFAULT 'v1' NOT NULL,
	"creative_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"technical_result" jsonb NOT NULL,
	"factual_notes" text,
	"result" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evaluation_runs_type_check" CHECK ("evaluation_runs"."evaluator_type" in ('automated','human','ai_proposed')),
	CONSTRAINT "evaluation_runs_result_check" CHECK ("evaluation_runs"."result" in ('pass','needs_review','fail'))
);
--> statement-breakpoint
CREATE TABLE "lesson_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"episode_id" text NOT NULL,
	"storyboard_version" integer NOT NULL,
	"context_kind" text NOT NULL,
	"applied_by" text NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_applications_context_check" CHECK ("lesson_applications"."context_kind" in ('storyboard','script'))
);
--> statement-breakpoint
CREATE TABLE "production_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fingerprint" text NOT NULL,
	"category" text NOT NULL,
	"scope" text DEFAULT 'global' NOT NULL,
	"statement" text NOT NULL,
	"status" text DEFAULT 'candidate' NOT NULL,
	"source_feedback_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"occurrence_count" integer DEFAULT 1 NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "production_lessons_status_check" CHECK ("production_lessons"."status" in ('candidate','approved','rejected')),
	CONSTRAINT "production_lessons_count_positive" CHECK ("production_lessons"."occurrence_count" > 0)
);
--> statement-breakpoint
CREATE TABLE "render_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"episode_id" text NOT NULL,
	"version" integer NOT NULL,
	"storyboard_version" integer NOT NULL,
	"artifact_path" text NOT NULL,
	"artifact_sha256" text NOT NULL,
	"duration_ms" integer NOT NULL,
	"qa_result" jsonb NOT NULL,
	"status" text DEFAULT 'proposed' NOT NULL,
	"approval_actor" text,
	"approval_reason" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "render_versions_version_positive" CHECK ("render_versions"."version" > 0),
	CONSTRAINT "render_versions_duration_positive" CHECK ("render_versions"."duration_ms" > 0),
	CONSTRAINT "render_versions_status_check" CHECK ("render_versions"."status" in ('proposed','needs_changes','approved'))
);
--> statement-breakpoint
CREATE TABLE "scene_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"render_version_id" uuid NOT NULL,
	"scene_id" text,
	"rating" integer NOT NULL,
	"problem_code" text,
	"comment" text NOT NULL,
	"requested_correction" text,
	"reviewer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scene_feedback_rating_range" CHECK ("scene_feedback"."rating" between 1 and 5)
);
--> statement-breakpoint
ALTER TABLE "evaluation_runs" ADD CONSTRAINT "evaluation_runs_render_version_id_render_versions_id_fk" FOREIGN KEY ("render_version_id") REFERENCES "public"."render_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_applications" ADD CONSTRAINT "lesson_applications_lesson_id_production_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."production_lessons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_applications" ADD CONSTRAINT "lesson_applications_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "render_versions" ADD CONSTRAINT "render_versions_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scene_feedback" ADD CONSTRAINT "scene_feedback_render_version_id_render_versions_id_fk" FOREIGN KEY ("render_version_id") REFERENCES "public"."render_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evaluation_runs_render_created_idx" ON "evaluation_runs" USING btree ("render_version_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_applications_once_uq" ON "lesson_applications" USING btree ("lesson_id","episode_id","storyboard_version","context_kind");--> statement-breakpoint
CREATE INDEX "lesson_applications_episode_idx" ON "lesson_applications" USING btree ("episode_id");--> statement-breakpoint
CREATE UNIQUE INDEX "production_lessons_fingerprint_uq" ON "production_lessons" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX "production_lessons_status_category_idx" ON "production_lessons" USING btree ("status","category");--> statement-breakpoint
CREATE UNIQUE INDEX "render_versions_episode_version_uq" ON "render_versions" USING btree ("episode_id","version");--> statement-breakpoint
CREATE INDEX "render_versions_episode_created_idx" ON "render_versions" USING btree ("episode_id","created_at");--> statement-breakpoint
CREATE INDEX "scene_feedback_render_idx" ON "scene_feedback" USING btree ("render_version_id","created_at");--> statement-breakpoint
CREATE INDEX "scene_feedback_problem_idx" ON "scene_feedback" USING btree ("problem_code");