import { enrollmentsTable } from '@fcaj/schema'
import { and, desc, eq, lt } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../infra/db'
import {
  enrollmentDeleteParamsDto,
  enrollmentGetParamsDto,
  enrollmentPostBodyDto,
  enrollmentsGetQueryDto,
  enrollmentStatusPatchParamsDto,
  enrollmentStatusPatchQueryDto,
} from './enrollments.dto'

export const listEnrollments = async (
  limit: z.infer<typeof enrollmentsGetQueryDto>['limit'],
  cursor: z.infer<typeof enrollmentsGetQueryDto>['cursor'],
  status: z.infer<typeof enrollmentsGetQueryDto>['status'],
) => {
  const rows = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        cursor != null ? lt(enrollmentsTable.id, cursor) : undefined,
        status != null ? eq(enrollmentsTable.status, status) : undefined,
      ),
    )
    .orderBy(desc(enrollmentsTable.id))
    .limit(limit + 1)

  const hasNextPage = rows.length > limit
  const data = rows.slice(0, limit)
  const lastRow = data[data.length - 1]

  return {
    data,
    pageInfo: {
      hasNextPage,
      nextCursor: hasNextPage && lastRow ? lastRow.id : null,
    },
  }
}

export const getEnrollment = async (id: z.infer<typeof enrollmentGetParamsDto>['id']) => {
  const row = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.id, id)).limit(1)

  return row[0] ?? null
}

export const createEnrollment = async (input: z.infer<typeof enrollmentPostBodyDto>) => {
  const row = await db
    .insert(enrollmentsTable)
    .values({
      ...input,
    })
    .returning()

  // HACKME
  return row[0]!
}

export const deleteEnrollment = async (id: z.infer<typeof enrollmentDeleteParamsDto>['id']) => {
  const row = await db.delete(enrollmentsTable).where(eq(enrollmentsTable.id, id)).returning()

  return row[0]!
}

export const updateEnrollmentStatus = async (
  id: z.infer<typeof enrollmentStatusPatchParamsDto>['id'],
  newStatus: z.infer<typeof enrollmentStatusPatchQueryDto>['status'],
) => {
  const row = await db
    .update(enrollmentsTable)
    .set({ status: newStatus })
    .where(eq(enrollmentsTable.id, id))
    .returning()

  return row[0]!
}
