import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getCurrentUserRecord } from "@/lib/auth/session"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Menu,
  LogOut,
  Plus,
  List,
  Compass,
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUserRecord()

  if (!currentUser) {
    redirect("/login")
  }

  if (currentUser.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-zinc-200 bg-white lg:flex dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              LocalLens
            </span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1 px-4">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/attractions"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              <List className="h-4 w-4" />
              Attractions
            </Link>
            <Link
              href="/admin/attractions/new"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              <Plus className="h-4 w-4" />
              Add New Attraction
            </Link>
          </nav>
        </div>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {currentUser.name.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {currentUser.name}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {currentUser.email}
              </p>
            </div>
          </div>
          <form
            action={async () => {
              "use server"
              await auth.api.signOut({
                headers: await headers(),
              })
              redirect("/login")
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md lg:hidden dark:border-zinc-800 dark:bg-zinc-950/80">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
            <Compass className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            LocalLens
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 bg-white dark:bg-zinc-950"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-16 items-center border-b border-zinc-200 px-2 dark:border-zinc-800">
                <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Menu
                </span>
              </div>
              <nav className="mt-6 flex flex-col gap-1 px-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/attractions"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                >
                  <List className="h-4 w-4" />
                  Attractions
                </Link>
                <Link
                  href="/admin/attractions/new"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </Link>
                <div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />
                <form
                  action={async () => {
                    "use server"
                    await auth.api.signOut({
                      headers: await headers(),
                    })
                    redirect("/login")
                  }}
                >
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <main className="flex-1 p-4 pt-24 sm:p-8 lg:ml-72 lg:pt-8">
        {children}
      </main>
    </div>
  )
}
