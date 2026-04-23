"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, CalendarDays, Navigation } from "lucide-react"

import LightRays from "@/components/LightRays"
import {
  DESTINATIONS,
  FEATURES,
  micro,
  NAV_LINKS,
  ROUTE_STEPS,
  spring,
  STATS,
} from "@/components/home/homepage-content"
import {
  AnimatedNumber,
  DestinationCard,
  FeatureCard,
  SectionLabel,
} from "@/components/home/homepage-primitives"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HomeHeader({ scrolled }: { scrolled: boolean }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/55 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent backdrop-blur-none"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="text-xl font-semibold tracking-tight">
            LocalLens
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.08 * index }}
            >
              <Link
                href={`/${item.toLowerCase()}`}
                className="rounded-lg px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item}
              </Link>
            </motion.div>
          ))}
        </nav>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={micro}
        >
          <Button
            asChild
            size="sm"
            className="h-8 rounded-full px-4 text-xs font-semibold"
          >
            <Link href="/explore">Get started</Link>
          </Button>
        </motion.div>
      </div>
    </motion.header>
  )
}

export function HeroSection() {
  return (
    <motion.section className="relative flex min-h-[92vh] flex-col items-center justify-center px-5 pt-24 pb-20 text-center lg:px-8">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-60 dark:opacity-30">
        <LightRays
          raysOrigin="top-center"
          raysColor="#10b981"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.3] dark:opacity-[0.1]"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.05),transparent_70%)] blur-2xl" />

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.18 }}
        className="relative max-w-4xl text-[clamp(2.6rem,7vw,5.5rem)] leading-[1.06] font-semibold tracking-[-0.03em]"
      >
        Plan your hill-country
        <br className="hidden sm:block" />
        <span className="bg-gradient-to-r from-muted-foreground to-muted-foreground/60 bg-clip-text text-transparent">
          {" "}
          day trip beautifully.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.26 }}
        className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg"
      >
        Discover attractions, compare the mood of each stop, and build a route
        that feels good to follow.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.34 }}
        className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
      >
        <motion.div>
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full px-8 text-sm font-semibold shadow-lg shadow-primary/15 transition-shadow hover:shadow-xl hover:shadow-primary/20"
          >
            <Link href="/explore" className="flex items-center gap-2">
              Start Exploring
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={micro}
        >
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-full px-8 text-sm font-semibold backdrop-blur-sm"
          >
            <Link href="/planner" className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              Open Planner
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

export function StatsSection() {
  return (
    <section className="relative border-y border-border/40 bg-muted/30 px-5 py-16 backdrop-blur-sm lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary)/0.03)_50%,transparent_100%)]" />
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ ...spring, delay: index * 0.08 }}
            className="border-l-2 border-border pl-5"
          >
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              <AnimatedNumber value={stat.value} />
            </p>
            <p className="mt-2 text-sm font-medium">{stat.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function DestinationsSection() {
  return (
    <section className="px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={spring}
          className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <SectionLabel>Destinations</SectionLabel>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
              Every attraction,{" "}
              <span className="text-muted-foreground">ranked and ready.</span>
            </h2>
          </div>
          <motion.div whileHover={{ x: 4 }} transition={micro}>
            <Link
              href="/explore"
              className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all 10+ stops
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.map((dest, index) => (
            <DestinationCard key={dest.name} dest={dest} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function RoutePreviewSection() {
  return (
    <section className="border-y border-border/60 bg-muted/20 px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={spring}
          >
            <div className="mb-5 inline-flex items-center justify-center rounded-xl border border-border bg-muted p-2.5">
              <Navigation className="size-4 text-muted-foreground" />
            </div>
            <SectionLabel>Route planning</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
              From scattered ideas to a beautifully paced day.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
              LocalLens sequences your stops using natural travel logic —
              sunrise outlooks first, golden-hour rail bridges last. You can
              always reorder, but the defaults just work.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ ...spring, delay: 0.1 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-6 py-4">
              <div>
                <SectionLabel>Day 01</SectionLabel>
                <p className="mt-1 text-base font-semibold tracking-tight">
                  Beragala → Ella
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Duration</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">
                  5h 26m
                </p>
              </div>
            </div>

            <div className="relative p-4">
              <div className="absolute top-6 bottom-6 left-[2.375rem] w-px bg-border/50" />

              <div className="space-y-1">
                {ROUTE_STEPS.map((step, index) => {
                  const Icon = step.icon

                  return (
                    <motion.div
                      key={step.place}
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ ...spring, delay: index * 0.08 + 0.2 }}
                      whileHover={{
                        x: 3,
                        backgroundColor: "hsl(var(--accent)/0.5)",
                      }}
                      className="group relative flex cursor-pointer items-start gap-4 rounded-xl px-3 py-2.5 transition-colors"
                    >
                      <div className="relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:border-border/80">
                        <Icon
                          className="size-3 text-muted-foreground transition-colors group-hover:text-foreground"
                          style={{ color: step.color }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2.5">
                          <p className="text-sm font-medium">{step.place}</p>
                          <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase tabular-nums">
                            {step.time}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {step.note}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  return (
    <section className="px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={spring}
          className="mb-14 max-w-2xl"
        >
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
            Built around how good travel{" "}
            <span className="text-muted-foreground">actually happens.</span>
          </h2>
        </motion.div>
        <div className="grid gap-4 lg:grid-cols-3">
          {FEATURES.map((feat, index) => (
            <FeatureCard key={feat.label} feat={feat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function MapCtaSection() {
  return (
    <section className="px-5 pt-4 pb-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={spring}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-muted/40 to-muted/20 px-10 py-20 text-center shadow-lg shadow-primary/5 sm:px-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,hsl(var(--primary)/0.08),transparent)]" />
          <div className="pointer-events-none absolute -top-20 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.06),transparent_70%)] blur-3xl" />

          <div className="relative">
            <SectionLabel>Explore the map</SectionLabel>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
              Map-first. Always.{" "}
              <span className="bg-gradient-to-r from-muted-foreground to-muted-foreground/50 bg-clip-text text-transparent">
                Because geography is everything.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
              The explore map shows every stop in context — distance, elevation,
              category. Filter down to exactly the kind of day you&apos;re
              feeling.
            </p>
            <motion.div
              className="mt-9 inline-block"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={micro}
            >
              <Button
                asChild
                size="lg"
                className="h-11 rounded-full px-8 font-semibold"
              >
                <Link href="/explore">Open the Map</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function FooterSection() {
  return (
    <footer className="relative overflow-hidden border-t border-border/40 bg-muted/10 px-5 py-10 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,hsl(var(--primary)/0.02)_100%)]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[200px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.04),transparent_80%)] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ ...spring, duration: 0.8 }}
        className="relative mx-auto flex max-w-6xl flex-col items-center text-center"
      >
        <h2 className="bg-gradient-to-b from-white via-neutral-300 to-black bg-clip-text text-[clamp(3.5rem,12vw,9rem)] leading-[0.9] font-bold tracking-[-0.04em] text-transparent">
          LocalLens
        </h2>
      </motion.div>
    </footer>
  )
}
