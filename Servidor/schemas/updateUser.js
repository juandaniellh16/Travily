import z from 'zod'

const updateUserSchema = z.object({
  name: z.string({
    invalid_type_error: 'User name must be a string'
  }).optional(),
  username: z.string({
    invalid_type_error: 'User username must be a string'
  }).optional(),
  email: z.string({
    invalid_type_error: 'User email must be a string'
  }).email('User email must be a valid email').optional(),
  currentPassword: z.string({
    invalid_type_error: 'User current password must be a string'
  }).optional(),
  newPassword: z.string({
    invalid_type_error: 'User new password must be a string'
  }).optional(),
  avatar: z.string({
    invalid_type_error: 'User avatar must be a string'
  }).url('User avatar must be a valid URL').or(z.string().refine((value) => value.startsWith('/images/'))).nullable().optional()
})

export function validateUpdateUser (input) {
  return updateUserSchema.safeParse(input)
}
