import { Outfit } from "next/font/google"
import "./globals.css"
import { PwaRegister } from "@/components/shared/pwa-register"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <PwaRegister />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
