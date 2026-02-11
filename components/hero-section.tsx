"use client"

import { Button } from "@/components/ui/button"
import { Github, ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 lg:px-24">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Student Progress</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Docs</a>
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
        </div>
        <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary bg-transparent">
          Sign In
        </Button>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-20 text-center md:pb-32 md:pt-28">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>AI-Powered Analytics for Students</span>
        </div>

        {/* Heading */}
        <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Track your GitHub progress
          <br />
          <span className="text-muted-foreground">with AI insights</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          Get real-time analytics on your commits, PRs, and contributions.
          Our AI analyzes your code to help you grow as a developer.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="group h-12 gap-2 bg-foreground px-6 text-background hover:bg-foreground/90"
            asChild
          >
            <a href="https://github.com/apps/student-progress/installations/new">
              <Github className="h-5 w-5" />
              Connect GitHub Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 border-border px-6 text-foreground hover:bg-secondary bg-transparent"
            asChild
          >
            <a href="/api/auth/callback/github?installation_id=105130625&setup_action=install">
              Continue to Dashboard
            </a>
          </Button>
        </div>


        {/* Disclaimer */}
        <p className="mt-8 text-sm text-muted-foreground/60">
          By connecting, you authorize Student Progress to access your GitHub repositories
        </p>
      </div>

      {/* Decorative grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
    </section>
  )
}
