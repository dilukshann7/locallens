import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"

export type AppSession = typeof auth.$Infer.Session

export interface CurrentUserRecord {
  id: string
  name: string
  email: string
  role: "admin" | "tourist"
}

export async function getServerSession(): Promise<AppSession | null> {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export async function getCurrentUserRecord(): Promise<CurrentUserRecord | null> {
  const session = await getServerSession()

  if (!session?.user) {
    return null
  }

  const currentUser = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .then((rows) => rows[0] ?? null)

  return currentUser
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const currentUser = await getCurrentUserRecord()
  return currentUser?.role === "admin"
}
