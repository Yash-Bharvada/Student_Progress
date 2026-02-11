"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sparkles,
  Code2,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Loader2,
  Play,
  Bug,
  Terminal,
  Cpu
} from "lucide-react"

import { analyzeRepositoryCode, getUserRepositories, type Repository } from "./actions"
import { type CodeAnalysisResult } from "@/lib/gemini"

// Removed demoRepositories



import { toast } from "sonner"

// ... imports

export default function AIFeedbackPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check')
        const data = await res.json()

        if (!data.authenticated) {
          router.push('/')
          return
        }

        if (data.user.role === 'admin') router.push('/admin')
        else if (data.user.role === 'mentor') router.push('/mentor')
      } catch (error) {
        console.error('Auth check failed', error)
      }
    }
    checkAuth()
  }, [router])
  const [repositories, setRepositories] = useState<Repository[]>([])

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const repos = await getUserRepositories()
        setRepositories(repos)
      } catch (error) {
        console.error("Failed to fetch repositories", error)
      }
    }
    fetchRepos()
  }, [])

  const [selectedRepo, setSelectedRepo] = useState("")
  const [filePath, setFilePath] = useState("app/page.tsx")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<CodeAnalysisResult | null>(null)

  // "Real" mode vs "Simulation" mode
  // For this task, we prioritize the interface working, so we'll simulate if API fails or is not meant to be mocked yet


  const handleAnalyze = async () => {
    if (!selectedRepo || !filePath) return

    setIsAnalyzing(true)
    setShowResults(false)
    setAnalysisResults(null)

    try {
      const result = await analyzeRepositoryCode(selectedRepo, filePath)
      setAnalysisResults(result)
      setShowResults(true)
      toast.success("Analysis complete!")
    } catch (error: any) {
      console.error("Analysis failed:", error)
      toast.error(error.message || "Failed to analyze code")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <TopBar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="relative border-b border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

            <div className="relative px-6 py-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      AI Code Analysis
                    </h1>
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-sm">
                      Beta
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get intelligent insights and suggestions for your code
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Analysis Form */}
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-purple-500" />
                    Select Target
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Cpu className="h-3 w-3" />
                    Model: Cortex-beta-1.0
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Repository</label>
                    <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                      <SelectTrigger className="bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Select a repository" />
                      </SelectTrigger>
                      <SelectContent>
                        {repositories.map((repo) => (
                          <SelectItem key={repo.id} value={repo.full_name}>
                            <div className="flex items-center gap-2">
                              <FileCode className="h-4 w-4 text-muted-foreground" />
                              {repo.name}
                              {repo.language && (
                                <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">
                                  {repo.language}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">File Path</label>
                    <Input
                      placeholder="e.g., README.md, src/main.py"
                      value={filePath}
                      onChange={(e) => setFilePath(e.target.value)}
                      className="bg-secondary/50 border-border/50 font-mono text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80" onClick={() => setFilePath("README.md")}>README.md</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80" onClick={() => setFilePath("package.json")}>package.json</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80" onClick={() => setFilePath("app/page.tsx")}>app/page.tsx</Badge>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20 border-primary/20 text-primary" onClick={() => setFilePath("__FULL_ANALYSIS__")}>Full Analysis (Slow)</Badge>
                    </div>
                  </div>
                </div>

                <Button
                  className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.01]"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={!selectedRepo || !filePath || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Repository & Code...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4 fill-current" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Results */}
            {showResults && analysisResults ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Overall Score */}
                <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          Analysis Complete
                        </h3>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Success
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Analyzed <span className="font-mono text-foreground/80">{filePath}</span> in {selectedRepo}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Quality Score</div>
                        <div className="text-2xl font-bold text-foreground">{analysisResults?.score}/10</div>
                      </div>
                      <div className="relative h-16 w-16">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-secondary"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="url(#scoreGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${(analysisResults?.score || 0) * 17.5} 175`}
                          />
                          <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-foreground">
                            {analysisResults.score}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Strengths */}
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-md bg-green-500/10">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                      <h3 className="font-semibold text-foreground">Key Strengths</h3>
                    </div>
                    <ul className="space-y-3">
                      {analysisResults.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex items-start gap-2.5">
                          <span className="block h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Issues */}
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-md bg-amber-500/10">
                        <Bug className="h-4 w-4 text-amber-500" />
                      </div>
                      <h3 className="font-semibold text-foreground">Potential Issues</h3>
                    </div>
                    <ul className="space-y-3">
                      {analysisResults.issues.map((issue, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex items-start gap-2.5">
                          <span className="block h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggestions */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-md bg-blue-500/10">
                        <Lightbulb className="h-4 w-4 text-blue-500" />
                      </div>
                      <h3 className="font-semibold text-foreground">Suggestions</h3>
                    </div>
                    <ul className="space-y-3">
                      {analysisResults.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex items-start gap-2.5">
                          <span className="block h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              !isAnalyzing && (
                <div className="relative overflow-hidden rounded-xl border border-border/50 border-dashed bg-card/50 p-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50 mb-4 animate-pulse">
                      <Code2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Ready to Analyze
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Select a repository and file above to start the AI code quality assessment.
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
