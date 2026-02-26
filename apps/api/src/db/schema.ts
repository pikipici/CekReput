import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core'

// ─── Enums ───────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['user', 'moderator', 'admin'])
export const accountTypeEnum = pgEnum('account_type', ['bank', 'ewallet', 'phone'])
export const threatLevelEnum = pgEnum('threat_level', ['safe', 'warning', 'danger'])
export const reportCategoryEnum = pgEnum('report_category', [
  'marketplace', 'investasi', 'pinjol', 'phishing', 'cod', 'lowker', 'romance', 'other',
])
export const reportStatusEnum = pgEnum('report_status', ['pending', 'verified', 'rejected'])
export const clarificationStatusEnum = pgEnum('clarification_status', ['pending', 'approved', 'rejected'])

// ─── Users ───────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  googleId: varchar('google_id', { length: 255 }).unique(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  role: userRoleEnum('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Perpetrators ────────────────────────────────────────────────

export const perpetrators = pgTable('perpetrators', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountNumber: varchar('account_number', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 50 }),
  entityName: varchar('entity_name', { length: 255 }),
  socialMedia: varchar('social_media', { length: 500 }),
  bankName: varchar('bank_name', { length: 100 }),
  accountType: accountTypeEnum('account_type').notNull().default('bank'),
  threatLevel: threatLevelEnum('threat_level').notNull().default('safe'),
  totalReports: integer('total_reports').notNull().default(0),
  verifiedReports: integer('verified_reports').notNull().default(0),
  totalLoss: integer('total_loss').notNull().default(0),
  firstReported: timestamp('first_reported', { withTimezone: true }),
  lastReported: timestamp('last_reported', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Reports ─────────────────────────────────────────────────────

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  perpetratorId: uuid('perpetrator_id').notNull().references(() => perpetrators.id, { onDelete: 'cascade' }),
  reporterId: uuid('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: reportCategoryEnum('category').notNull(),
  chronology: text('chronology').notNull(),
  incidentDate: date('incident_date').notNull(),
  lossAmount: integer('loss_amount'),
  evidenceLink: varchar('evidence_link', { length: 500 }),
  status: reportStatusEnum('status').notNull().default('pending'),
  rejectionReason: varchar('rejection_reason', { length: 500 }),
  moderatedBy: uuid('moderated_by').references(() => users.id),
  moderatedAt: timestamp('moderated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Evidence Files ──────────────────────────────────────────────

export const evidenceFiles = pgTable('evidence_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Comments ────────────────────────────────────────────────────

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  perpetratorId: uuid('perpetrator_id').notNull().references(() => perpetrators.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  upvotes: integer('upvotes').notNull().default(0),
  downvotes: integer('downvotes').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── API Keys ────────────────────────────────────────────────────

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  keyHash: varchar('key_hash', { length: 255 }).notNull().unique(),
  label: varchar('label', { length: 100 }).notNull(),
  rateLimitPerMin: integer('rate_limit_per_min').notNull().default(60),
  isActive: boolean('is_active').notNull().default(true),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Clarifications (Hak Jawab) ─────────────────────────────────

export const clarifications = pgTable('clarifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  perpetratorId: uuid('perpetrator_id').notNull().references(() => perpetrators.id, { onDelete: 'cascade' }),
  requesterId: uuid('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  statement: text('statement').notNull(),
  status: clarificationStatusEnum('status').notNull().default('pending'),
  evidenceUrl: varchar('evidence_url', { length: 500 }),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
