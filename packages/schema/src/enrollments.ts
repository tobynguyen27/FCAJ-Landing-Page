import { boolean, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod'

export const statusEnum = pgEnum('status', ['pending', 'approved', 'declined'])

export const enrollmentsTable = pgTable('enrollments', {
  id: integer().generatedAlwaysAsIdentity({ startWith: 0, minValue: 0, increment: 1 }).primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  phoneNumber: text().notNull().unique(),
  university: text(),
  city: text().notNull(),
  hasIntern: boolean().default(false),
  status: statusEnum().default('pending'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
})

export const enrollmentSelectSchema = createSelectSchema(enrollmentsTable)
export const enrollmentInsertSchema = createInsertSchema(enrollmentsTable)
export const enrollmentUpdateSchema = createUpdateSchema(enrollmentsTable)
