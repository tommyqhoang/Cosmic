import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    webadmin: number
    banned: number
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      webadmin: number
      banned: number
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    webadmin: number
    banned: number
  }
}
