import z from "zod";

const itineraryListSchema = z.object({
  title: z.string({
    invalid_type_error: "Itinerary list title must be a string",
    required_error: "Itinerary list title is required",
  }),
  description: z
    .string({
      invalid_type_error: "Itinerary list description must be a string",
    })
    .optional(),
  image: z
    .string({
      invalid_type_error: "Itinerary list image must be a string",
    })
    .url("Itinerary list image must be a valid URL")
    .nullable()
    .optional(),
  isPublic: z
    .boolean({
      invalid_type_error: "Itinerary list isPublic must be a boolean",
    })
    .optional(),
  userId: z.string({
    invalid_type_error: "Itinerary list userId must be a string",
    required_error: "Itinerary list userId is required",
  }),
});

export function validateItineraryList(input) {
  return itineraryListSchema.safeParse(input);
}

export function validatePartialItineraryList(input) {
  return itineraryListSchema.partial().safeParse(input);
}
