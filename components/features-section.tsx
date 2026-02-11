"use client"

import { BarChart3, Bot, TrendingUp, GitBranch, Code2, Users } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track commits, pull requests, and contributions with live updates and detailed breakdowns.",
    color: "from-emerald-500/20 to-emerald-500/5"
  },
  {
    icon: Bot,
    title: "AI Code Analysis",
    description: "Get intelligent insights powered by AI that analyzes your code patterns and suggests improvements.",
    color: "from-cyan-500/20 to-cyan-500/5"
  },
  {
    icon: TrendingUp,
    title: "Skill Tracking",
    description: "Monitor your language proficiency growth and see how your skills evolve over time.",
    color: "from-amber-500/20 to-amber-500/5"
  },
  {
    icon: GitBranch,
    title: "Repository Insights",
    description: "Deep dive into each repository with commit history, branch analysis, and contribution metrics.",
    color: "from-rose-500/20 to-rose-500/5"
  },
  {
    icon: Code2,
    title: "Code Quality Scores",
    description: "Receive detailed scores on code quality, maintainability, and best practices adherence.",
    color: "from-violet-500/20 to-violet-500/5"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Compare progress with classmates and participate in coding challenges together.",
    color: "from-blue-500/20 to-blue-500/5"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need to grow
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Powerful tools designed to help students track their coding journey and improve their skills with data-driven insights.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-border/80 hover:bg-card/80"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-100`} />
              
              <div className="relative">
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <feature.icon className="h-6 w-6 text-foreground" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
