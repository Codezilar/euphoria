import { auth } from '@clerk/nextjs/server'

type Roles = 'admin' | 'user' | 'moderator'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  return (sessionClaims?.metadata as any)?.role === role
}