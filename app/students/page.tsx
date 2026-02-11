"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Users, UserPlus, Search, Filter, MoreVertical, Mail, Github, BookOpen, GraduationCap, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

import { getStudents, addStudent, updateStudent, deleteStudent, type StudentData } from "./actions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ProjectDetailDialog } from "@/components/project-detail-dialog"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StudentsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [students, setStudents] = useState<StudentData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isMentor, setIsMentor] = useState(false)
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/check')
                const data = await res.json()
                if (data.user?.role === 'mentor') {
                    setIsMentor(true)
                }
            } catch (error) {
                console.error("Auth check failed", error)
            }
        }
        checkAuth()
    }, [])

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const data = await getStudents()
                setStudents(data)
            } catch (error) {
                console.error("Failed to load students", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadStudents()
    }, [])

    const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const formData = new FormData(e.currentTarget)
            const result = await addStudent(formData)

            if (result.success) {
                // Refresh list
                const data = await getStudents()
                setStudents(data)
                setIsDialogOpen(false)
                e.currentTarget.reset()
            } else {
                alert("Failed to add student: " + result.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateStudent = async (id: string, formData: FormData) => {
        const result = await updateStudent(id, formData)
        if (result.success) {
            const data = await getStudents()
            setStudents(data)
        } else {
            alert("Failed to update: " + result.error)
        }
    }

    const handleDeleteStudent = async (id: string) => {
        if (!confirm("Are you sure you want to remove this student? This cannot be undone.")) return

        const result = await deleteStudent(id)
        if (result.success) {
            const data = await getStudents()
            setStudents(data)
        } else {
            alert("Failed to delete: " + result.error)
        }
    }

    const handleViewProject = async (projectId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}`)
            const data = await res.json()
            if (data.success) {
                setSelectedProject(data.project)
                setIsProjectDialogOpen(true)
            } else {
                alert("Failed to load project details")
            }
        } catch (error) {
            console.error("Error fetching project:", error)
            alert("Error loading project")
        }
    }

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.githubHandle.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || student.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
            case 'graduated': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            default: return 'bg-gray-500/20 text-gray-400'
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
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 pointer-events-none" />

                        <div className="relative px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20">
                                        <Users className="h-5 w-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                            Students
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            {isMentor ? `Review ${students.length} students` : `Manage your ${students.length} students`}
                                        </p>
                                    </div>
                                </div>


                                {!isMentor && (
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg shadow-orange-500/20">
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Add Student
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add New Student</DialogTitle>
                                                <DialogDescription>
                                                    Enter the details of the student you want to add to the system.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleAddStudent} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input id="name" name="name" placeholder="John Doe" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="githubHandle">GitHub Username</Label>
                                                    <Input id="githubHandle" name="githubHandle" placeholder="johndoe" />
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                                    <Button type="submit" disabled={isSubmitting}>
                                                        {isSubmitting ? 'Adding...' : 'Add Student'}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-4 mt-6">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        placeholder="Search students..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-card border-border/50"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {['all', 'active', 'graduated', 'inactive'].map((status) => (
                                        <Button
                                            key={status}
                                            variant={statusFilter === status ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilter(status)}
                                            className="capitalize"
                                        >
                                            {status}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-secondary/50 text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Student</th>
                                            <th className="px-6 py-4 font-medium">Current Project</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 font-medium">Progress</th>
                                            <th className="px-6 py-4 font-medium">Joined</th>
                                            <th className="px-6 py-4 font-medium"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id} className="group hover:bg-secondary/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-border/50">
                                                            <AvatarImage src={student.avatar} />
                                                            <AvatarFallback className="bg-orange-500/10 text-orange-500">
                                                                {student.name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-foreground">{student.name}</div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {student.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-foreground">
                                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                        {student.projectId ? (
                                                            <button
                                                                onClick={() => handleViewProject(student.projectId!)}
                                                                className="hover:underline hover:text-orange-500 transition-colors text-left"
                                                            >
                                                                {student.projectName}
                                                            </button>
                                                        ) : (
                                                            <span className="text-muted-foreground italic">No Project</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Github className="h-3 w-3" />
                                                        {student.githubHandle}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={getStatusColor(student.status)}>
                                                        {student.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 min-w-[140px]">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-medium">{student.progress}%</span>
                                                    </div>
                                                    <Progress value={student.progress} className="h-1.5 bg-secondary [&>div]:bg-orange-500" />
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {new Date(student.enrollmentDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {!isMentor && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                            Edit Details
                                                                        </DropdownMenuItem>
                                                                    </DialogTrigger>
                                                                    <DialogContent>
                                                                        <DialogHeader>
                                                                            <DialogTitle>Edit Student</DialogTitle>
                                                                        </DialogHeader>
                                                                        <form action={async (formData) => {
                                                                            await handleUpdateStudent(student.id, formData)
                                                                            // Close dialog logic would be better with specific state, but for now this works via server action revalidation
                                                                        }} className="space-y-4">
                                                                            <div className="space-y-2">
                                                                                <Label>Full Name</Label>
                                                                                <Input name="name" defaultValue={student.name} required />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label>Email</Label>
                                                                                <Input name="email" defaultValue={student.email} required />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label>GitHub Username</Label>
                                                                                <Input name="githubHandle" defaultValue={student.githubHandle} />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label>Course</Label>
                                                                                <Input name="course" defaultValue={student.course} />
                                                                            </div>
                                                                            <DialogFooter>
                                                                                <Button type="submit">Save Changes</Button>
                                                                            </DialogFooter>
                                                                        </form>
                                                                    </DialogContent>
                                                                </Dialog>
                                                                <DropdownMenuItem
                                                                    className="text-red-500 focus:text-red-500"
                                                                    onClick={() => handleDeleteStudent(student.id)}
                                                                >
                                                                    Remove Student
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredStudents.length === 0 && (
                                <div className="p-12 text-center text-muted-foreground">
                                    {isLoading ? "Loading students..." : "No students found matching your criteria"}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                {/* Project Detail Dialog */}
                {isProjectDialogOpen && selectedProject && (
                    <ProjectDetailDialog
                        project={selectedProject}
                        isMentor={isMentor}
                        onClose={() => {
                            setIsProjectDialogOpen(false)
                            setSelectedProject(null)
                        }}
                        onUpdate={(updatedProject) => {
                            // Refresh students list to update progress/name if changed
                            const loadStudents = async () => {
                                const data = await getStudents()
                                setStudents(data)
                            }
                            loadStudents()

                            // Update local selected project logic if needed, but we usually close or just let it re-render
                            setSelectedProject(updatedProject)
                        }}
                    />
                )}
            </SidebarInset>
        </SidebarProvider>
    )
}
