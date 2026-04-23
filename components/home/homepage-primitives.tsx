"use client"

import { motion, useInView } from "framer-motion"
import {
  ChevronRight,
  Clock,
  Mountain,
  Star,
} from "lucide-react"
import { useRef, useState, type ReactNode } from "react"

import {
  type Destination,
  type Feature,
  micro,
  spring,
} from "@/components/home/homepage-content"

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

export function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={spring}
    >
      {value}
    </motion.span>
  )
}

export function DestinationCard({
  dest,
  index,
}: {
  dest: Destination
  index: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...spring, delay: index * 0.05 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-300 hover:border-border/80 hover:bg-accent/30"
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: dest.accent }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.18 }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {dest.tag}
          </span>
          <div className="flex items-center gap-1">
            <Star
              className="size-3 transition-colors duration-200"
              style={{
                color: hovered ? dest.accent : "var(--muted-foreground)",
                fill: hovered ? dest.accent : "transparent",
              }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {dest.rating}
            </span>
          </div>
        </div>

        <h3 className="mt-5 text-base font-semibold tracking-tight">
          {dest.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{dest.type}</p>

        <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mountain className="size-3" />
            {dest.elevation}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {dest.time}
          </div>
          <motion.div
            animate={{ x: hovered ? 0 : -8, opacity: hovered ? 1 : 0 }}
            transition={micro}
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: dest.accent }}
          >
            Add <ChevronRight className="size-3" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export function FeatureCard({
  feat,
  index,
}: {
  feat: Feature
  index: number
}) {
  const Icon = feat.icon
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...spring, delay: index * 0.09 }}
      className="group rounded-2xl border border-border bg-card p-7 transition-colors duration-300 hover:border-border/80 hover:bg-accent/20"
    >
      <motion.div
        className="mb-5 inline-flex items-center justify-center rounded-xl border border-border bg-muted p-2.5"
        whileHover={{ scale: 1.06, rotate: 3 }}
        transition={micro}
      >
        <Icon
          className="size-4 transition-colors duration-200"
          style={{ color: feat.accent }}
        />
      </motion.div>
      <SectionLabel>{feat.label}</SectionLabel>
      <h3 className="mt-3 text-lg leading-snug font-semibold tracking-tight">
        {feat.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {feat.body}
      </p>
    </motion.div>
  )
}
