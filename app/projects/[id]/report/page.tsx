"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, FileText, Download, Sparkles, Github } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function AIReportPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)

    const [isLoadingAuth, setIsLoadingAuth] = useState(true)
    const [project, setProject] = useState<any>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [reportContent, setReportContent] = useState<string | null>(null)
    const [fetchError, setFetchError] = useState<string | null>(null)

    useEffect(() => {
        const checkAuthAndFetchProject = async () => {
            try {
                const authRes = await fetch('/api/auth/check')
                const authData = await authRes.json()

                if (!authData.authenticated || authData.user.role !== 'mentor') {
                    router.push('/projects')
                    return
                }

                // Fetch single project details
                const res = await fetch('/api/projects')
                const data = await res.json()

                if (data.success) {
                    const p = data.projects.find((p: any) => p._id === id)
                    if (p) {
                        setProject(p)
                    } else {
                        setFetchError("Project not found.")
                    }
                }
            } catch (error) {
                console.error("Error loading project/auth:", error)
                setFetchError("Failed to load project details.")
            } finally {
                setIsLoadingAuth(false)
            }
        }
        checkAuthAndFetchProject()
    }, [id, router])

    const handleGenerate = async () => {
        setIsGenerating(true)
        setReportContent(null)
        setFetchError(null)
        try {
            const res = await fetch(`/api/projects/${id}/report`, { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                setReportContent(data.report)
            } else {
                setFetchError(data.error || "Failed to generate report")
            }
        } catch (error) {
            setFetchError("Network error while generating report")
            console.error("Failed to generate report:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownloadPDF = () => {
        if (!reportContent || !project) return

        const originalTitle = document.title;
        // Setting the document title forces the browser's Save to PDF dialog to use this as the default file name
        document.title = `${project.name} - IEEE AI Report`;

        window.print();

        // Restore original title immediately after the print dialog is triggered
        document.title = originalTitle;
    }

    if (isLoadingAuth) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
                <h2 className="text-xl font-bold">{fetchError || "Project not found"}</h2>
                <Button onClick={() => router.push('/projects')}>Back to Projects</Button>
            </div>
        )
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto">
                    {/* Header */}
                    <div className="border-b border-border/50 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5">
                        <div className="px-6 py-8">
                            <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground" onClick={() => router.back()}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="w-6 h-6 text-blue-500" />
                                <h1 className="text-3xl font-bold tracking-tight">AI Project Report</h1>
                            </div>
                            <p className="text-muted-foreground max-w-2xl">
                                Generate a highly professional, IEEE-formatted academic report for <strong className="text-foreground">{project.name}</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-w-4xl mx-auto space-y-6">

                        {/* Information Warning Banner */}
                        {!project.githubUrl && (
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-sm flex items-start gap-3">
                                <Github className="w-5 h-5 shrink-0" />
                                <div>
                                    <strong>No GitHub repository linked.</strong>
                                    <p className="mt-1">The AI will strictly rely on the project description, tech stack, and objectives. For a better technical analysis, ask the student to link their GitHub Repository.</p>
                                </div>
                            </div>
                        )}

                        {fetchError && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                                {fetchError}
                            </div>
                        )}

                        {!reportContent ? (
                            <div className="bg-card border rounded-xl p-8 text-center space-y-6 shadow-sm">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">Ready to analyze</h3>
                                    <p className="text-sm text-muted-foreground mx-auto max-w-md">
                                        Click below to trigger the AI engine. It will analyze the project metadata and produce a document strictly following the IEEE academic structure.
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transform transition hover:scale-105"
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Processing...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-3" /> Generate IEEE Report</>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
                                <div className="flex items-center justify-between mb-4 sticky top-4 z-10 bg-background/80 backdrop-blur-md p-4 rounded-xl border shadow-sm">
                                    <div className="text-sm font-medium text-muted-foreground flex items-center">
                                        <FileText className="w-4 h-4 mr-2" /> Document Preview
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setReportContent(null)}>
                                            Discard
                                        </Button>
                                        <Button
                                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                                            onClick={handleDownloadPDF}
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                                            Export to PDF
                                        </Button>
                                    </div>
                                </div>

                                {/* Google Docs Style A4 Paper Wrapper */}
                                <div className="flex justify-center bg-muted/30 p-4 md:p-8 rounded-xl overflow-x-auto">
                                    <div
                                        id="pdf-report-container"
                                        className="bg-white text-black shrink-0 shadow-lg font-sans"
                                        style={{
                                            width: '210mm',
                                            minHeight: '297mm',
                                            padding: '25.4mm', // 1 inch margins like standard Docs
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <div className="prose prose-sm max-w-none text-black prose-headings:font-bold prose-headings:text-black prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-blue-600 prose-p:leading-relaxed prose-li:leading-relaxed prose-table:w-full prose-td:border prose-td:border-gray-300 prose-td:p-2 prose-th:bg-gray-100 prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:italic">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportContent}</ReactMarkdown>
                                        </div>
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
