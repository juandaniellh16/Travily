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
  description: z.string({
    invalid_type_error: 'Event description must be a string'
  }),
  image: z.string({
    invalid_type_error: 'Event image must be a string'
  }).url('Event image must be a valid URL').or(z.string().refine((value) => value.startsWith('/images/'))).nullable().optional(),
  content: z.string({
    invalid_type_error: 'Event content must be a string'
  })
})

export function validateEvent (input) {
  return eventSchema.safeParse(input)
}

export function validatePartialEvent (input) {
  return eventSchema.partial().safeParse(input)
}
