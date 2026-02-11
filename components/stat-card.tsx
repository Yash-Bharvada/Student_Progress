"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "blue" | "green" | "amber" | "pink"
  delay?: number
}

const colorStyles = {
  blue: {
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    border: "group-hover:border-blue-500/30",
  },
  green: {
    iconBg: "bg-green-500/10",
    iconColor: "text-green-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]",
    border: "group-hover:border-green-500/30",
  },
  amber: {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    border: "group-hover:border-amber-500/30",
  },
  pink: {
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]",
    border: "group-hover:border-pink-500/30",
  },
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "blue",
  delay = 0,
}: StatCardProps) {
  const styles = colorStyles[color]

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all duration-300",
        styles.glow,
        styles.border,
        "hover:-translate-y-0.5"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight text-foreground">
                {value}
              </h3>
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center text-xs font-medium",
                    trend.isPositive ? "text-green-400" : "text-red-400"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
              styles.iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", styles.iconColor)} />
          </div>
        </div>
      </div>
    </div>
  )
}
