import z from "zod";

export const locationSchema = z.object(
  {
    geonameId: z.number({
      invalid_type_error: "Geoname id must be a number",
      required_error: "Geoname id is required",
    }),
    name: z.string({
      invalid_type_error: "Location name must be a string",
      required_error: "Location name is required",
    }),
    countryName: z
      .string({
        invalid_type_error: "Country name must be a string",
      })
      .nullable()
      .optional(),
    adminName1: z
      .string({
        invalid_type_error: "Admin name must be a string",
      })
      .nullable()
      .optional(),
    fcode: z.string({
      invalid_type_error: "Fcode must be a string",
      required_error: "Fcode is required",
    }),
    lat: z
      .number({
        invalid_type_error: "Latitude must be a number",
      })
      .nullable()
      .optional(),
    lng: z
      .number({
        invalid_type_error: "Longitude must be a number",
      })
      .nullable()
      .optional(),
  },
  {
    invalid_type_error: "Location must be an object",
    required_error: "Location is required",
  },
);

export function validateLocation(input) {
  return locationSchema.safeParse(input);
}

export function validatePartialLocation(input) {
  return locationSchema.partial().safeParse(input);
}
