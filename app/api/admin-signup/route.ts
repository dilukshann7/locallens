import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, adminSecret } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Invalid admin secret" },
        { status: 403 }
      )
    }

    const h = await headers()

    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
      headers: h,
    })

    // Update user role to admin
    const db = await import("@/lib/db").then((m) => m.db)
    const { user } = await import("@/lib/db/schema")
    const { eq } = await import("drizzle-orm")

    await db.update(user).set({ role: "admin" }).where(eq(user.email, email))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin signup error:", error)
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 }
    )
  }
}
