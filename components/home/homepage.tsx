"use client"

import { useScroll, useMotionValueEvent } from "framer-motion"
import { useState } from "react"

import {
  DestinationsSection,
  FeaturesSection,
  FooterSection,
  HeroSection,
  HomeHeader,
  MapCtaSection,
  RoutePreviewSection,
  StatsSection,
} from "@/components/home/homepage-sections"

export function HomePage() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20)
  })

  return (
    <main className="dark relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
      <div className="relative z-10">
        <HomeHeader scrolled={scrolled} />
        <HeroSection />
        <StatsSection />
        <DestinationsSection />
        <RoutePreviewSection />
        <FeaturesSection />
        <MapCtaSection />
        <FooterSection />
      </div>
    </main>
  )
}
