export const authService = {
  register: async (
    name: string,
    username: string,
    email: string,
    password: string,
    avatar: string | null
  ) => {
    const response = await fetch(`/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password, avatar })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Register error')
    }
  },

  login: async (usernameOrEmail: string, password: string) => {
    const response = await fetch(`/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ usernameOrEmail, password })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Login error')
    }

    return await response.json()
  },

  logout: async () => {
    const response = await fetch(`/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Logout error')
    }
  }
}
