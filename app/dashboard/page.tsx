"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { GitCommit, GitPullRequest, FolderGit2, Users, TrendingUp, Activity, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ActivityFeed } from "@/components/activity-feed"
import { SkillProgress } from "@/components/skill-progress"

interface DashboardData {
    stats: {
        totalCommits: number
        totalPRs: number
        totalRepos: number
        activeStudents: number
    }
    recentActivities: any[]
    skills: any[]
    repositories: any[]
}

export default function DashboardPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const authResponse = await fetch('/api/auth/check')
                const authData = await authResponse.json()

                if (!authData.authenticated) {
                    router.push('/')
                    return
                }

                // Store user for role-based rendering
                setUser(authData.user)

                // Redirect based on role
                if (authData.user.role === 'admin') {
                    router.push('/admin')
                    return
                }
                if (authData.user.role === 'mentor') {
                    router.push('/mentor')
                    return
                }

                const dashboardResponse = await fetch('/api/dashboard')
                const data = await dashboardResponse.json()

                if (!data.success) {
                    throw new Error(data.error || 'Failed to load dashboard data')
                }

                setDashboardData(data)
            } catch (error) {
                console.error('Error loading dashboard:', error)
                setError(String(error))
            } finally {
                setIsLoading(false)
            }
        }

        loadDashboard()
    }, [router])

    if (isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-background">
                    <TopBar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <p className="text-muted-foreground">Loading your GitHub data...</p>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    if (error || !dashboardData) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-background">
                    <TopBar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center max-w-md">
                            <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    const stats = [
        {
            name: "Total Commits",
            value: dashboardData.stats.totalCommits.toString(),
            icon: GitCommit,
            color: "from-blue-500 to-cyan-500",
            textColor: "text-blue-400",
        },
        {
            name: "Pull Requests",
            value: dashboardData.stats.totalPRs.toString(),
            icon: GitPullRequest,
            color: "from-purple-500 to-pink-500",
            textColor: "text-purple-400",
        },
        {
            name: "Repositories",
            value: dashboardData.stats.totalRepos.toString(),
            icon: FolderGit2,
            color: "from-green-500 to-emerald-500",
            textColor: "text-green-400",
        },
        {
            name: "Active Students",
            value: dashboardData.stats.activeStudents.toString(),
            icon: Users,
            color: "from-orange-500 to-red-500",
            textColor: "text-orange-400",
        },
    ]

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
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 blur-lg opacity-30" />
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                        Dashboard
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Your GitHub activity overview
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Stats Grid */}
                        <div className={cn(
                            "grid gap-4 sm:grid-cols-2",
                            user?.role === "student" ? "lg:grid-cols-3" : "lg:grid-cols-4"
                        )}>
                            {stats
                                .filter(stat => {
                                    // Hide "Active Students" from students
                                    if (stat.name === "Active Students" && user?.role === "student") {
                                        return false;
                                    }
                                    return true;
                                })
                                .map((stat, index) => (
                                    <div
                                        key={stat.name}
                                        className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 hover:shadow-lg transition-shadow"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-br opacity-5 pointer-events-none",
                                            stat.color
                                        )} />

                                        <div className="relative">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={cn(
                                                    "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br",
                                                    stat.color
                                                )}>
                                                    <stat.icon className="h-5 w-5 text-white" />
                                                </div>
                                                <TrendingUp className={cn("h-4 w-4", stat.textColor)} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{stat.name}</p>
                                                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Charts and Activity */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Skill Progress */}
                            {dashboardData.skills.length > 0 && (
                                <SkillProgress skills={dashboardData.skills} />
                            )}

                            {/* Activity Feed */}
                            {dashboardData.recentActivities.length > 0 && (
                                <ActivityFeed activities={dashboardData.recentActivities} />
                            )}
                        </div>

                        {/* Empty State */}
                        {dashboardData.recentActivities.length === 0 && (
                            <div className="relative overflow-hidden rounded-xl border border-border/50 border-dashed bg-card/50 p-12">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50 mb-4">
                                        <Activity className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-1">
                                        No Recent Activity
                                    </h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Start committing to see your progress and activity here!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
