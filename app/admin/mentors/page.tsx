"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Users, FolderGit2 } from "lucide-react"

export default function AdminMentorsPage() {
    const router = useRouter()
    const [mentors, setMentors] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchMentors()
    }, [])

    const fetchMentors = async () => {
        try {
            const authRes = await fetch('/api/auth/check')
            const authData = await authRes.json()

            if (!authData.authenticated || authData.user.role !== 'admin') {
                router.push('/')
                return
            }

            const res = await fetch('/api/admin/mentors/detailed')
            const data = await res.json()
            if (data.success) {
                setMentors(data.mentors)
            }
        } catch (error) {
            console.error('Failed to fetch mentors', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Mentor Overview</h1>
                        <p className="text-muted-foreground">View detailed statistics for all mentors including assigned students and ongoing projects.</p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : mentors.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-xl font-medium text-foreground">No mentors found</p>
                                <p className="text-sm text-muted-foreground">Add mentors from the admin dashboard.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {mentors.map((mentor) => (
                                <Card
                                    key={mentor._id}
                                    className="cursor-pointer hover:border-primary/50 transition-colors"
                                    onClick={() => router.push(`/admin/mentors/${mentor._id}`)}
                                >
                                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                        <Avatar className="h-12 w-12 border border-border">
                                            <AvatarImage src={mentor.avatar} />
                                            <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg truncate">{mentor.name}</CardTitle>
                                            <CardDescription className="truncate">{mentor.email}</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                            <div className="flex flex-col items-center flex-1">
                                                <div className="flex items-center text-muted-foreground mb-1">
                                                    <Users className="h-4 w-4 mr-1" />
                                                    <span className="text-xs font-medium">Students</span>
                                                </div>
                                                <span className="text-2xl font-bold">{mentor.studentCount}</span>
                                            </div>
                                            <div className="w-px h-10 bg-border mx-2" />
                                            <div className="flex flex-col items-center flex-1">
                                                <div className="flex items-center text-muted-foreground mb-1">
                                                    <FolderGit2 className="h-4 w-4 mr-1" />
                                                    <span className="text-xs font-medium">Projects</span>
                                                </div>
                                                <span className="text-2xl font-bold">{mentor.projectCount}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
