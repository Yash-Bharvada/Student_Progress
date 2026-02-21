"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, FolderGit2, Users, Mail, BookOpen } from "lucide-react"

export default function MentorDetailsPage() {
    const router = useRouter()
    const { id } = useParams()

    const [mentor, setMentor] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchMentorDetails(id as string)
        }
    }, [id])

    const fetchMentorDetails = async (mentorId: string) => {
        try {
            const authRes = await fetch('/api/auth/check')
            const authData = await authRes.json()

            if (!authData.authenticated || authData.user.role !== 'admin') {
                router.push('/')
                return
            }

            const res = await fetch(`/api/admin/mentors/${mentorId}/details`)
            const data = await res.json()
            if (data.success) {
                setMentor(data.mentor)
                setStudents(data.students)
                setProjects(data.projects)
            } else {
                router.push('/admin/mentors')
            }
        } catch (error) {
            console.error('Failed to fetch mentor details', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-background">
                    <TopBar />
                    <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-[500px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Loading mentor details...</p>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    if (!mentor) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-background">
                    <TopBar />
                    <main className="flex-1 p-6">
                        <div className="flex flex-col items-center justify-center h-[500px] text-center">
                            <h2 className="text-2xl font-bold mb-2">Mentor Not Found</h2>
                            <p className="text-muted-foreground mb-6">The mentor you are looking for does not exist or has been removed.</p>
                            <Button onClick={() => router.push('/admin/mentors')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                            </Button>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto p-6">
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            className="mb-4 -ml-4 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            onClick={() => router.push('/admin/mentors')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Mentors
                        </Button>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-primary/20 bg-background shadow-sm">
                                <AvatarImage src={mentor.avatar} />
                                <AvatarFallback className="text-2xl transition-all">{mentor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{mentor.name}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <Mail className="h-4 w-4" />
                                    <span>{mentor.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Projects Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FolderGit2 className="h-5 w-5 text-primary" />
                                Supervised Projects ({projects.length})
                            </h2>
                            {projects.length === 0 ? (
                                <Card>
                                    <CardContent className="py-8 text-center text-muted-foreground flex flex-col items-center">
                                        <FolderGit2 className="h-10 w-10 mb-3 opacity-20" />
                                        <p>No projects supervised by this mentor yet.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                projects.map((project) => (
                                    <Card key={project._id} className="overflow-hidden border-border/50 hover:border-primary/20 transition-all">
                                        <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
                                                    <CardDescription className="mt-1.5 line-clamp-2">{project.description}</CardDescription>
                                                </div>
                                                <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="shrink-0 capitalize">
                                                    {project.status.replace('-', ' ')}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="mb-3 text-sm font-medium flex items-center gap-2 text-foreground/80">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>Team Members ({project.teamMembers?.length || 0})</span>
                                            </div>
                                            {project.teamMembers && project.teamMembers.length > 0 ? (
                                                <div className="space-y-2.5">
                                                    {project.teamMembers.map((member: any) => (
                                                        <div key={member._id} className="flex items-center gap-3 bg-muted/20 p-2 rounded-md">
                                                            <Avatar className="h-8 w-8 border border-border/50">
                                                                <AvatarImage src={member.avatar} />
                                                                <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium truncate">{member.name}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic bg-muted/20 p-2 rounded-md">No students assigned to this project.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Students Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Assigned Students ({students.length})
                            </h2>
                            <Card className="border-border/50">
                                <CardContent className="p-0">
                                    {students.length === 0 ? (
                                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                                            <Users className="h-10 w-10 mb-3 opacity-20" />
                                            <p>No students assigned to this mentor yet.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border/50">
                                            {students.map((student) => {
                                                // Find which project this student is in
                                                const studentProject = projects.find(p =>
                                                    p.teamMembers?.some((m: any) => m._id === student._id)
                                                );

                                                return (
                                                    <div key={student._id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                                                        <Avatar className="h-10 w-10 border border-border/50">
                                                            <AvatarImage src={student.avatar} />
                                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <p className="font-medium text-sm truncate">{student.name}</p>
                                                                {student.course && (
                                                                    <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 py-0 font-normal">
                                                                        {student.course}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                                                            {studentProject && (
                                                                <div className="flex items-center gap-1.5 mt-2 text-xs text-primary/80 bg-primary/5 inline-flex p-1 pr-2 rounded-sm max-w-full">
                                                                    <BookOpen className="h-3 w-3 shrink-0" />
                                                                    <span className="truncate">{studentProject.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
