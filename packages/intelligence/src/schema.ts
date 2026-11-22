import {sql} from 'drizzle-orm';
import {check, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid} from 'drizzle-orm/pg-core';

export type QaSnapshot = {passed: boolean; checks?: Array<{id: string; passed: boolean; detail?: string}>; [key: string]: unknown};
export type CreativeScores = Partial<Record<'visualStorytelling'|'sceneVariety'|'narrationQuality'|'pacing'|'readability'|'factualAccuracy', number>>;
export type TechnicalResult = {passed: boolean; checks: Array<{id: string; passed: boolean; detail?: string}>};

export const episodes = pgTable('episodes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  journeyTemplate: text('journey_template').notNull(),
  storyboardPath: text('storyboard_path').notNull(),
  storyboardVersion: integer('storyboard_version').notNull(),
  lifecycleStatus: text('lifecycle_status').notNull().default('draft'),
  createdAt: timestamp('created_at', {withTimezone:true}).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', {withTimezone:true}).notNull().defaultNow(),
}, t => [check('episodes_storyboard_version_positive', sql`${t.storyboardVersion} > 0`)]);

export const renderVersions = pgTable('render_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  episodeId: text('episode_id').notNull().references(() => episodes.id, {onDelete:'restrict'}),
  version: integer('version').notNull(),
  storyboardVersion: integer('storyboard_version').notNull(),
  artifactPath: text('artifact_path').notNull(),
  artifactSha256: text('artifact_sha256').notNull(),
  durationMs: integer('duration_ms').notNull(),
  qaResult: jsonb('qa_result').$type<QaSnapshot>().notNull(),
  status: text('status').notNull().default('proposed'),
  approvalActor: text('approval_actor'),
  approvalReason: text('approval_reason'),
  approvedAt: timestamp('approved_at', {withTimezone:true}),
  createdAt: timestamp('created_at', {withTimezone:true}).notNull().defaultNow(),
}, t => [
  uniqueIndex('render_versions_episode_version_uq').on(t.episodeId,t.version),
  index('render_versions_episode_created_idx').on(t.episodeId,t.createdAt),
  check('render_versions_version_positive',sql`${t.version} > 0`),
  check('render_versions_duration_positive',sql`${t.durationMs} > 0`),
  check('render_versions_status_check',sql`${t.status} in ('proposed','needs_changes','approved')`),
]);

export const sceneFeedback = pgTable('scene_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  renderVersionId: uuid('render_version_id').notNull().references(() => renderVersions.id, {onDelete:'restrict'}),
  sceneId: text('scene_id'),
  rating: integer('rating').notNull(),
  problemCode: text('problem_code'),
  comment: text('comment').notNull(),
  requestedCorrection: text('requested_correction'),
  reviewer: text('reviewer').notNull(),
  createdAt: timestamp('created_at', {withTimezone:true}).notNull().defaultNow(),
}, t => [
  index('scene_feedback_render_idx').on(t.renderVersionId,t.createdAt),
  index('scene_feedback_problem_idx').on(t.problemCode),
  check('scene_feedback_rating_range',sql`${t.rating} between 1 and 5`),
]);

export const productionLessons = pgTable('production_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  fingerprint: text('fingerprint').notNull(),
  category: text('category').notNull(),
  scope: text('scope').notNull().default('global'),
  statement: text('statement').notNull(),
  status: text('status').notNull().default('candidate'),
  sourceFeedbackIds: jsonb('source_feedback_ids').$type<string[]>().notNull().default([]),
  occurrenceCount: integer('occurrence_count').notNull().default(1),
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at', {withTimezone:true}),
  createdAt: timestamp('created_at', {withTimezone:true}).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', {withTimezone:true}).notNull().defaultNow(),
}, t => [
  uniqueIndex('production_lessons_fingerprint_uq').on(t.fingerprint),
  index('production_lessons_status_category_idx').on(t.status,t.category),
  check('production_lessons_status_check',sql`${t.status} in ('candidate','approved','rejected')`),
  check('production_lessons_count_positive',sql`${t.occurrenceCount} > 0`),
]);

export const evaluationRuns = pgTable('evaluation_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  renderVersionId: uuid('render_version_id').notNull().references(() => renderVersions.id, {onDelete:'restrict'}),
  evaluator: text('evaluator').notNull(),
  evaluatorType: text('evaluator_type').notNull(),
  modelVersion: text('model_version'),
  criteriaVersion: text('criteria_version').notNull().default('v1'),
  creativeScores: jsonb('creative_scores').$type<CreativeScores>().notNull().default({}),
  technicalResult: jsonb('technical_result').$type<TechnicalResult>().notNull(),
  factualNotes: text('factual_notes'),
  result: text('result').notNull(),
  createdAt: timestamp('created_at', {withTimezone:true}).notNull().defaultNow(),
}, t => [
  index('evaluation_runs_render_created_idx').on(t.renderVersionId,t.createdAt),
  check('evaluation_runs_type_check',sql`${t.evaluatorType} in ('automated','human','ai_proposed')`),
  check('evaluation_runs_result_check',sql`${t.result} in ('pass','needs_review','fail')`),
]);

export const lessonApplications = pgTable('lesson_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => productionLessons.id, {onDelete:'restrict'}),
  episodeId: text('episode_id').notNull().references(() => episodes.id, {onDelete:'restrict'}),
  storyboardVersion: integer('storyboard_version').notNull(),
  contextKind: text('context_kind').notNull(),
  appliedBy: text('applied_by').notNull(),
  appliedAt: timestamp('applied_at', {withTimezone:true}).notNull().defaultNow(),
}, t => [
  uniqueIndex('lesson_applications_once_uq').on(t.lessonId,t.episodeId,t.storyboardVersion,t.contextKind),
  index('lesson_applications_episode_idx').on(t.episodeId),
  check('lesson_applications_context_check',sql`${t.contextKind} in ('storyboard','script')`),
]);
