import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Sign In",
  description:
    "Sign in to LocalLens to save itineraries, manage your planner, and leave reviews.",
})

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
