import z from 'zod'

const userSchema = z.object({
  name: z.string({
    invalid_type_error: 'User name must be a string',
    required_error: 'User name is required'
  }),
  username: z.string({
    invalid_type_error: 'User username must be a string',
    required_error: 'User username is required'
  }),
  email: z.string({
    invalid_type_error: 'User email must be a string',
    required_error: 'User email is required'
  }).email('User email must be a valid email'),
  password: z.string({
    invalid_type_error: 'User password must be a string',
    required_error: 'User password is required'
  }),
  avatar: z.string({
    invalid_type_error: 'User avatar must be a string'
  }).url('User avatar must be a valid URL').or(z.string().refine((value) => value.startsWith('/images/'))).nullable().optional()
})

export function validateUser (input) {
  return userSchema.safeParse(input)
}

export function validatePartialUser (input) {
  return userSchema.partial().safeParse(input)
}
