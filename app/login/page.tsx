"use client"

import { useState } from "react"
import { signIn } from "@/lib/auth/client"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    await signIn.email({
      email,
      password,
      fetchOptions: {
        onSuccess() {
          window.location.href = "/"
        },
        onError(ctx) {
          setError(ctx.error.message || "Failed to sign in")
          setLoading(false)
        },
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-100 p-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">LocalLens</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Discover local attractions in Beragala, Sri Lanka
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 text-2xl font-semibold">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href="/signup"
              className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}