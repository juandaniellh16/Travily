import z from 'zod'

const daySchema = z.object({
  label: z.string({
    invalid_type_error: 'Day lable must be a string',
    required_error: 'Day lable is required'
  }),
  dayNumber: z.number({
    invalid_type_error: 'Day number must be a number',
    required_error: 'Day number is required'
  })
})

export function validateDay (input) {
  return daySchema.safeParse(input)
}

export function validatePartialDay (input) {
  return daySchema.partial().safeParse(input)
}
