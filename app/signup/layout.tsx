import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Create Account",
  description:
    "Create a LocalLens account to save day plans and share practical travel notes.",
})

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
