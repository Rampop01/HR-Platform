export interface AuthSession {
  token: string
  user: {
    id: number
    name: string
    email: string
  }
}

const SESSION_KEY = 'hcmatrix_session'

export const auth = {
  saveSession(session: AuthSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }
  },

  getSession(): AuthSession | null {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem(SESSION_KEY)
      return session ? JSON.parse(session) : null
    }
    return null
  },

  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY)
    }
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null
  },

  getToken(): string | null {
    return this.getSession()?.token || null
  },
}
