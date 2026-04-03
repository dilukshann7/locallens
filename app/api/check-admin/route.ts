import { NextResponse } from "next/server"
import { isCurrentUserAdmin } from "@/lib/auth/session"

export async function GET() {
  try {
    return NextResponse.json({ isAdmin: await isCurrentUserAdmin() })
  } catch {
    return NextResponse.json({ isAdmin: false })
  }
}
