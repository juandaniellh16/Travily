import z from "zod";

const loginSchema = z.object({
  usernameOrEmail: z.string({
    invalid_type_error: "User/Email must be a string",
    required_error: "User/Email is required",
  }),
  password: z.string({
    invalid_type_error: "Password must be a string",
    required_error: "Password is required",
  }),
});

export function validateLogin(input) {
  return loginSchema.safeParse(input);
}
