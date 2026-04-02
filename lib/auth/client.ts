"use client"

import { createAuthClient } from "better-auth/react"

const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"

export const authClient = createAuthClient({
  baseURL,
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient

type UserRole = "admin" | "tourist"

export function useIsAdmin() {
  const { data: session } = useSession()
  return (session?.user as { role?: UserRole })?.role === "admin"
}

export function useIsTourist() {
  const { data: session } = useSession()
  return (session?.user as { role?: UserRole })?.role === "tourist"
}

export function useUserRole(): UserRole | null {
  const { data: session } = useSession()
  return ((session?.user as { role?: UserRole })?.role as UserRole) || null
}