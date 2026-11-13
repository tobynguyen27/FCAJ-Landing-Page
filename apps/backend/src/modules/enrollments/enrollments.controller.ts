import { Elysia } from 'elysia'

import {
  enrollmentDeleteParamsDto,
  enrollmentDeleteResponseDto,
  enrollmentGetParamsDto,
  enrollmentGetResponseDto,
  enrollmentPostBodyDto,
  enrollmentPostResponseDto,
  enrollmentsGetQueryDto,
  enrollmentsGetResponseDto,
  enrollmentStatusPatchParamsDto,
  enrollmentStatusPatchQueryDto,
  enrollmentStatusPatchResponseDto,
} from './enrollments.dto'
import {
  createEnrollment,
  deleteEnrollment,
  getEnrollment,
  listEnrollments,
  updateEnrollmentStatus,
} from './enrollments.service'

export const enrollmentsModule = new Elysia({ name: 'enrollments', prefix: '/enrollments' })
  .get(
    '/',
    {
      query: enrollmentsGetQueryDto,
      response: enrollmentsGetResponseDto,
    },
    async ({ query }) => {
      const data = await listEnrollments(query.limit, query.cursor, query.status)

      return data
    },
  )
  .get(
    '/:id',
    {
      params: enrollmentGetParamsDto,
      response: enrollmentGetResponseDto,
    },
    async ({ params }) => {
      const data = await getEnrollment(params.id)

      return data
    },
  )
  .post(
    '/',
    {
      body: enrollmentPostBodyDto,
      response: enrollmentPostResponseDto,
    },
    async ({ body }) => {
      const data = await createEnrollment(body)

      return data
    },
  )
  .delete(
    '/:id',
    {
      params: enrollmentDeleteParamsDto,
      response: enrollmentDeleteResponseDto,
    },
    async ({ params }) => {
      const data = await deleteEnrollment(params.id)

      return data
    },
  )
  .patch(
    '/:id',
    {
      params: enrollmentStatusPatchParamsDto,
      query: enrollmentStatusPatchQueryDto,
      response: enrollmentStatusPatchResponseDto,
    },
    async ({ params, query }) => {
      const data = await updateEnrollmentStatus(params.id, query.status)

      return data
    },
  )
