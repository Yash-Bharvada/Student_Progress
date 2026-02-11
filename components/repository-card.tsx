"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  GitBranch, 
  Star, 
  GitFork, 
  ExternalLink, 
  Clock,
  Code2
} from "lucide-react"

interface Repository {
  id: string
  name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  updatedAt: string
  url: string
}

interface RepositoryCardProps {
  repository: Repository
  delay?: number
}

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3776ab",
  HTML: "#e34c26",
  CSS: "#1572b6",
  Dart: "#00b4ab",
  Unknown: "#6b7280",
}

export function RepositoryCard({ repository, delay = 0 }: RepositoryCardProps) {
  const languageColor = languageColors[repository.language || "Unknown"] || "#6b7280"

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300",
        "hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] hover:border-blue-500/30 hover:-translate-y-1"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
      </div>

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/50 border border-border/50 group-hover:border-blue-500/30 transition-colors">
              <GitBranch className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-blue-400 transition-colors">
                {repository.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {repository.description || "No description available"}
        </p>

        {/* Language & Stats */}
        <div className="mt-4 flex items-center gap-4">
          {repository.language && (
            <div className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: languageColor }}
              />
              <span className="text-xs text-muted-foreground">
                {repository.language}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-3.5 w-3.5" />
            <span className="text-xs">{repository.stars}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <GitFork className="h-3.5 w-3.5" />
            <span className="text-xs">{repository.forks}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Updated {repository.updatedAt}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            asChild
          >
            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              View on GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
