"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { BarChart3, Loader2, TrendingUp, AlertCircle } from "lucide-react"
import { AreaChart } from "@/components/charts/area-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { DonutChart } from "@/components/charts/donut-chart"
import { LineChart } from "@/components/charts/line-chart"

interface AnalyticsData {
    weeklyContributions: any[]
    languageDistribution: any[]
    repositoryContributions: any[]
    consistencyTrend: any[]
}

// Demo data to show when real data isn't available
const demoData: AnalyticsData = {
    weeklyContributions: [
        { week: 'Week 1', commits: 12 },
        { week: 'Week 2', commits: 19 },
        { week: 'Week 3', commits: 15 },
        { week: 'Week 4', commits: 22 },
    ],
    languageDistribution: [
        { language: 'TypeScript', percentage: 45 },
        { language: 'JavaScript', percentage: 25 },
        { language: 'Python', percentage: 15 },
        { language: 'HTML', percentage: 10 },
        { language: 'CSS', percentage: 5 },
    ],
    repositoryContributions: [
        { repository: 'Student_Progress', commits: 22 },
        { repository: 'LandingPage', commits: 15 },
        { repository: 'QuickFolio', commits: 12 },
        { repository: 'portfolio', commits: 8 },
    ],
    consistencyTrend: [
        { week: 'Week 1', score: 65 },
        { week: 'Week 2', score: 72 },
        { week: 'Week 3', score: 68 },
        { week: 'Week 4', score: 78 },
    ],
}

export default function AnalyticsPage() {
    const router = useRouter()
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(demoData)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isRealData, setIsRealData] = useState(false)

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const authResponse = await fetch('/api/auth/check')
                const authData = await authResponse.json()

                if (!authData.authenticated) {
                    router.push('/')
                    return
                }

                const analyticsResponse = await fetch('/api/analytics')
                const data = await analyticsResponse.json()

                console.log('Analytics API Response:', data)

                // Check if we have real data
                if (data.success && (
                    (data.weeklyContributions && data.weeklyContributions.length > 0) ||
                    (data.languageDistribution && data.languageDistribution.length > 0) ||
                    (data.repositoryContributions && data.repositoryContributions.length > 0) ||
                    (data.consistencyTrend && data.consistencyTrend.length > 0)
                )) {
                    setAnalyticsData(data)
                    setIsRealData(true)
                } else {
                    // Use demo data if no real data available
                    setAnalyticsData(demoData)
                    setIsRealData(false)
                }
            } catch (error) {
                console.error('Error loading analytics:', error)
                setError(String(error))
                // Use demo data on error
                setAnalyticsData(demoData)
                setIsRealData(false)
            } finally {
                setIsLoading(false)
            }
        }

        loadAnalytics()
    }, [router])

    if (isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-background">
                    <TopBar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
                            <p className="text-muted-foreground">Loading analytics...</p>
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
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

                        <div className="relative px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
                                        <BarChart3 className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                            Analytics
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            Insights into your coding activity
                                        </p>
                                    </div>
                                </div>

                                {/* Data Source Badge */}
                                {!isRealData && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                        <AlertCircle className="h-4 w-4 text-amber-400" />
                                        <span className="text-xs text-amber-400 font-medium">Demo Data</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Weekly Contributions */}
                            {analyticsData.weeklyContributions && analyticsData.weeklyContributions.length > 0 && (
                                <BarChart
                                    title="Weekly Contributions"
                                    data={analyticsData.weeklyContributions}
                                    xKey="week"
                                    yKeys={[
                                        { key: 'commits', color: '#3b82f6', name: 'Commits' }
                                    ]}
                                />
                            )}

                            {/* Language Distribution */}
                            {analyticsData.languageDistribution && analyticsData.languageDistribution.length > 0 && (
                                <DonutChart
                                    title="Language Distribution"
                                    data={analyticsData.languageDistribution}
                                />
                            )}

                            {/* Repository Contributions */}
                            {analyticsData.repositoryContributions && analyticsData.repositoryContributions.length > 0 && (
                                <BarChart
                                    title="Contributions by Repository"
                                    data={analyticsData.repositoryContributions}
                                    xKey="repository"
                                    yKeys={[
                                        { key: 'commits', color: '#8b5cf6', name: 'Commits' }
                                    ]}
                                />
                            )}

                            {/* Consistency Trend */}
                            {analyticsData.consistencyTrend && analyticsData.consistencyTrend.length > 0 && (
                                <LineChart
                                    title="Consistency Score Trend"
                                    data={analyticsData.consistencyTrend}
                                    xKey="week"
                                    yKeys={[
                                        { key: 'score', color: '#10b981', name: 'Score' }
                                    ]}
                                />
                            )}
                        </div>

                        {/* Info Message */}
                        {!isRealData && (
                            <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-amber-400 mb-1">
                                            Showing Demo Data
                                        </h4>
                                        <p className="text-sm text-amber-300/80">
                                            Real analytics data will automatically display here once you have more GitHub activity.
                                            The charts above show sample data to demonstrate the analytics features.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
