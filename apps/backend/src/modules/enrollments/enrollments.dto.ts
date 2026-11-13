import { enrollmentInsertSchema, enrollmentSelectSchema } from '@fcaj/schema'
import { z } from 'zod'

import { defaultPageLimit } from '../../infra/config'

// GET /enrollments
export const enrollmentsGetQueryDto = z.object({
  limit: z.coerce.number().min(1).max(100).default(defaultPageLimit),
  cursor: z.coerce.number().nullish(),
  status: enrollmentSelectSchema.shape.status.nullish(),
})

export const enrollmentsGetResponseDto = z.object({
  data: z.array(enrollmentSelectSchema),
  pageInfo: z.object({
    nextCursor: enrollmentSelectSchema.shape.id.nullable(),
    hasNextPage: z.boolean(),
  }),
})

// GET /enrollments/:id
export const enrollmentGetParamsDto = z.object({
  id: z.coerce.number(),
})

export const enrollmentGetResponseDto = enrollmentSelectSchema.nullable()

// POST /enrollments
export const enrollmentPostBodyDto = enrollmentInsertSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const enrollmentPostResponseDto = enrollmentSelectSchema

// DELETE /enrollments/:id
export const enrollmentDeleteParamsDto = z.object({
  id: z.coerce.number(),
})

export const enrollmentDeleteResponseDto = enrollmentSelectSchema

// PATCH /enrollments/:id?status
export const enrollmentStatusPatchParamsDto = z.object({
  id: z.coerce.number(),
})

export const enrollmentStatusPatchQueryDto = enrollmentSelectSchema.pick({ status: true })

export const enrollmentStatusPatchResponseDto = enrollmentSelectSchema
