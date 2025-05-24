import z from 'zod'

const eventSchema = z.object({
  orderIndex: z.number({
    invalid_type_error: 'Event orderIndex must be a number',
    required_error: 'Event orderIndex is required'
  }),
  label: z.string({
    invalid_type_error: 'Event lable must be a string',
    required_error: 'Event lable is required'
  }),
  description: z
    .string({
      invalid_type_error: 'Event description must be a string'
    })
    .optional(),
  category: z
    .enum(
      [
        'landmark',
        'food',
        'accommodation',
        'activity',
        'transport',
        'entertainment',
        'shopping',
        'art',
        'relax',
        'other'
      ],
      {
        errorMap: () => ({
          message:
            'Event category must be one of: landmark, food, accommodation, activity, transport, entertainment, shopping, art, relax, other'
        })
      }
    )
    .nullable()
    .optional(),
  image: z
    .string({
      invalid_type_error: 'Event image must be a string'
    })
    .url('Event image must be a valid URL')
    .or(z.string().refine((value) => value.startsWith('/images/')))
    .nullable()
    .optional(),
  startTime: z
    .preprocess(
      (arg) => (arg === '' || arg === null ? null : arg),
      z
        .string({
          invalid_type_error: 'Event startTime must be a string'
        })
        .regex(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, {
          message: 'Event startTime must be a valid time in HH:MM format'
        })
        .nullable()
    )
    .optional(),
  endTime: z
    .preprocess(
      (arg) => (arg === '' || arg === null ? null : arg),
      z
        .string({
          invalid_type_error: 'Event endTime must be a string'
        })
        .regex(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, {
          message: 'Event endTime must be a valid time in HH:MM format'
        })
        .nullable()
    )
    .optional()
})

export function validateEvent(input) {
  return eventSchema.safeParse(input)
}

export function validatePartialEvent(input) {
  return eventSchema.partial().safeParse(input)
}
