"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserPlus, GraduationCap } from "lucide-react"

export default function MentorPage() {
    const router = useRouter()
    const [students, setStudents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newStudent, setNewStudent] = useState({ name: '', email: '' })
    const [isEnrolling, setIsEnrolling] = useState(false)

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            // Check auth first
            const authRes = await fetch('/api/auth/check')
            const authData = await authRes.json()

            if (!authData.authenticated) {
                router.push('/')
                return
            }

            if (authData.user.role !== 'mentor') {
                router.push('/')
                return
            }

            const res = await fetch('/api/mentor/students')
            const data = await res.json()
            if (data.success) {
                setStudents(data.students)
            } else {
                if (res.status === 401) router.push('/')
            }
        } catch (error) {
            console.error('Failed to fetch students', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsEnrolling(true)
        try {
            const res = await fetch('/api/mentor/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStudent)
            })
            const data = await res.json()
            if (data.success) {
                setStudents([data.student, ...students])
                setNewStudent({ name: '', email: '' })
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error('Failed to enroll student', error)
        } finally {
            setIsEnrolling(false)
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                            <GraduationCap className="h-8 w-8 text-primary" />
                            Mentor Dashboard
                        </h1>
                        <p className="text-muted-foreground">Manage your students and their progress.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Enroll Student Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    Enroll New Student
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleEnroll} className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Student Name"
                                            value={newStudent.name}
                                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            type="email"
                                            placeholder="Student Email (for GitHub link)"
                                            value={newStudent.email}
                                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={isEnrolling} className="w-full">
                                        {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Enroll Student
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        * The student must use this email when signing in with GitHub.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Students List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>My Students ({students.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : students.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No students enrolled yet.</p>
                                ) : (
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {students.map((student) => (
                                            <div key={student._id} className="flex items-center gap-4 p-3 rounded-lg border bg-card/50">
                                                <Avatar>
                                                    <AvatarImage src={student.avatar} />
                                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {student.githubId ? (
                                                            <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">Linked</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
