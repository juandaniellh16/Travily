import z from "zod";

import { locationSchema } from "./locations.js";

const itinerarySchema = z.object({
  title: z.string({
    invalid_type_error: "Itinerary title must be a string",
    required_error: "Itinerary title is required",
  }),
  description: z
    .string({
      invalid_type_error: "Itinerary description must be a string",
    })
    .optional(),
  image: z
    .string({
      invalid_type_error: "Itinerary image must be a string",
    })
    .url("Itinerary image must be a valid URL")
    .nullable()
    .optional(),
  startDate: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z.date({
      invalid_type_error: "Itinerary startDate must be a valid date",
      required_error: "Itinerary startDate is required",
    }),
  ),
  endDate: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z.date({
      invalid_type_error: "Itinerary endDate must be a valid date",
      required_error: "Itinerary endDate is required",
    }),
  ),
  location: locationSchema,
  isPublic: z
    .boolean({
      invalid_type_error: "Itinerary isPublic must be a boolean",
    })
    .optional(),
  userId: z.string({
    invalid_type_error: "Itinerary userId must be a string",
    required_error: "Itinerary userId is required",
  }),
});

export function validateItinerary(input) {
  return itinerarySchema.safeParse(input);
}

export function validatePartialItinerary(input) {
  return itinerarySchema.partial().safeParse(input);
}
