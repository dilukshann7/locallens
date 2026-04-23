import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Admin Sign Up",
  description: "Restricted LocalLens admin account registration.",
})

export default function AdminSignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
