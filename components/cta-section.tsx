"use client"

import { Button } from "@/components/ui/button"
import { Github, ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-border px-6 py-24 md:py-32">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute left-1/4 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Ready to level up your coding?
        </h2>
        <p className="mb-10 text-lg text-muted-foreground">
          Join thousands of students who are already tracking their progress and improving their skills with AI-powered insights.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="group h-14 gap-2 bg-foreground px-8 text-lg text-background hover:bg-foreground/90"
            asChild
          >
            <a href="https://github.com/apps/student-progress/installations/new">
              <Github className="h-5 w-5" />
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </div>


        <p className="mt-6 text-sm text-muted-foreground">
          No credit card required · Free for students
        </p>
      </div>

      {/* Footer */}
      <footer className="relative mt-24 border-t border-border pt-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="text-sm text-muted-foreground">
            © 2026 Student Progress. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </section>
  )
}
