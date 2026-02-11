"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { GitBranch, Star, GitFork, Clock, Search, Loader2, ExternalLink, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Repository {
    id: number
    name: string
    full_name: string
    description: string | null
    language: string | null
    stargazers_count: number
    forks_count: number
    updated_at: string
    html_url: string
    private: boolean
}

export default function RepositoriesPage() {
    const router = useRouter()
    const [repositories, setRepositories] = useState<Repository[]>([])
    const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadRepositories = async () => {
            try {
                console.log('Checking authentication...')
                const authResponse = await fetch('/api/auth/check')
                const authData = await authResponse.json()

                console.log('Auth response:', authData)

                if (!authData.authenticated) {
                    router.push('/')
                    return
                }

                console.log('Fetching repositories...')
                const reposResponse = await fetch('/api/repositories')
                const data = await reposResponse.json()

                console.log('Repositories API response:', data)

                if (data.success && data.repositories) {
                    console.log(`Loaded ${data.repositories.length} repositories`)
                    setRepositories(data.repositories)
                    setFilteredRepos(data.repositories)
                } else {
                    setError(data.error || 'Failed to load repositories')
                }
            } catch (error) {
                console.error('Error loading repositories:', error)
                setError(String(error))
            } finally {
                setIsLoading(false)
            }
        }

        loadRepositories()
    }, [router])

    useEffect(() => {
        if (searchQuery) {
            const filtered = repositories.filter(repo =>
                repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredRepos(filtered)
        } else {
            setFilteredRepos(repositories)
        }
    }, [searchQuery, repositories])

    const languageColors: Record<string, string> = {
        JavaScript: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        TypeScript: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        Python: "bg-green-500/20 text-green-400 border-green-500/30",
        Java: "bg-red-500/20 text-red-400 border-red-500/30",
        Go: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        Rust: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        HTML: "bg-pink-500/20 text-pink-400 border-pink-500/30",
        CSS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    }

    if (isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-background">
                    <TopBar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
                            <p className="text-muted-foreground">Loading repositories...</p>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    if (error) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-background">
                    <TopBar />
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center max-w-md">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Error Loading Repositories</h2>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto">
                    {/* Header */}
                    <div className="relative border-b border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

                        <div className="relative px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20">
                                        <GitBranch className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                            Repositories
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            {repositories.length} repositories found
                                        </p>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search repositories..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-secondary/50 border-border/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {filteredRepos.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">
                                    {searchQuery ? 'No repositories match your search' : 'No repositories found'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredRepos
                                    .filter(repo => repo && repo.name)
                                    .map((repo) => (
                                        <div
                                            key={repo.name}
                                            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 hover:shadow-lg hover:border-border transition-all"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                            <div className="relative">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
                                                            <h3 className="font-semibold text-foreground truncate">
                                                                {repo.name}
                                                            </h3>
                                                        </div>
                                                        {repo.private && (
                                                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
                                                                Private
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <a
                                                        href={repo.html_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                                                    {repo.description || "No description provided"}
                                                </p>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-3">
                                                        {repo.language && (
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "text-xs",
                                                                    languageColors[repo.language] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                                                )}
                                                            >
                                                                {repo.language}
                                                            </Badge>
                                                        )}
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Star className="h-3 w-3" />
                                                            <span>{repo.stargazers_count}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <GitFork className="h-3 w-3" />
                                                            <span>{repo.forks_count}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
