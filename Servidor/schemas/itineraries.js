import z from 'zod'

const itinerarySchema = z.object({
  title: z.string({
    invalid_type_error: 'Itinerary title must be a string',
    required_error: 'Itinerary title is required.'
  }),
  description: z.string({
    invalid_type_error: 'Itinerary description must be a string'
  }),
  startDate: z.preprocess(
    (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
    z.date({
      invalid_type_error: 'Itinerary startDate must be a valid date',
      required_error: 'Itinerary startDate is required.'
    })
  ),
  endDate: z.preprocess(
    (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
    z.date({
      invalid_type_error: 'Itinerary endDate must be a valid date',
      required_error: 'Itinerary endDate is required.'
    })
  ),
  location: z.array(
    z.string(),
    {
      required_error: 'Itinerary location is required.',
      invalid_type_error: 'Itinerary location must be an array of string'
    }
  )
})

export function validateItinerary (input) {
  return itinerarySchema.safeParse(input)
}

export function validatePartialItinerary (input) {
  return itinerarySchema.partial().safeParse(input)
}
