"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    FolderGit2,
    Plus,
    Loader2,
    MoreVertical,
    Github,
    Clock,
    X,
    ExternalLink,
    Star,
    Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProjectDetailDialog } from "@/components/project-detail-dialog"

interface TeamMember {
    _id: string
    name: string
    avatar: string
    email: string
}

interface Project {
    _id: string
    name: string
    description: string
    status: 'planning' | 'active' | 'completed' | 'paused' | 'archived'
    startDate: string
    endDate: string
    progress?: number // Derived or stored? Model doesn't have it, we might need to calculate or mock for now
    techStack: string[]
    teamMembers: TeamMember[]
    githubRepos: string[]
    githubUrl?: string // Primary GitHub repository URL
    lastSynced?: string | null // Last GitHub sync timestamp
    updatedAt: string
    liveUrl?: string
    mentorId?: string | null
    createdBy?: {
        _id: string
        name: string
        avatar: string
        email: string
    } | string
}

interface Review {
    _id: string
    projectId: string
    mentorId: {
        _id: string
        name: string
        avatar: string
    }
    rating: number
    comment: string
    createdAt: string
}

export default function ProjectsPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const [isMentor, setIsMentor] = useState(false)
    const [mentors, setMentors] = useState<TeamMember[]>([])

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        techStack: '',
        githubUrl: '',
        mentorId: ''
    })

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            try {
                // Auth Check
                const authRes = await fetch('/api/auth/check')
                const authData = await authRes.json()

                if (!authData.authenticated) {
                    router.push('/')
                    return
                }

                if (authData.user.role === 'admin') {
                    router.push('/admin')
                    return
                }

                if (authData.user.role === 'mentor') {
                    setIsMentor(true)
                }

                // Fetch Projects
                const res = await fetch('/api/projects')
                const data = await res.json()
                if (data.success) {
                    setProjects(data.projects)
                }

                // Fetch Mentors for the dropdown
                const mentorsRes = await fetch('/api/mentors')
                const mentorsData = await mentorsRes.json()
                if (mentorsData.success) {
                    setMentors(mentorsData.mentors)
                }
            } catch (error) {
                console.error('Error loading projects', error)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuthAndFetch()
    }, [router])

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack?.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)

        try {
            const techStackArray = formData.techStack.split(',').map(t => t.trim()).filter(t => t)

            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    techStack: techStackArray
                })
            })

            const data = await res.json()

            if (data.success) {
                setProjects([data.project, ...projects])
                setIsDialogOpen(false)
                setFormData({ name: '', description: '', startDate: '', endDate: '', techStack: '', githubUrl: '', mentorId: '' })
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error('Failed to create project', error)
        } finally {
            setIsCreating(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'planning': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            case 'paused': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            default: return 'bg-gray-500/20 text-gray-400'
        }
    }

    const getDaysRemaining = (endDate: string) => {
        const remaining = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        if (remaining < 0) return 'Ended'
        return `${remaining} days left`
    }

    // Mock progress calculation based on milestones... or just random for now since backend doesn't aggregate it yet?
    // Let's default to 0
    const getProgress = (project: Project) => project.progress || 0

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto">
                    {/* Header */}
                    <div className="relative border-b border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                        <div className="relative px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <FolderGit2 className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                            Projects
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            {isMentor
                                                ? `Review and track progress for ${projects.length} student projects`
                                                : `Manage and track your ${projects.length} projects`
                                            }
                                        </p>
                                    </div>
                                </div>

                                {!isMentor && (
                                    <Button
                                        onClick={() => setIsDialogOpen(true)}
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/20"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Project
                                    </Button>
                                )}
                            </div>

                            {/* Search */}
                            <div className="mt-6 max-w-md relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Search projects by name or technology..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-secondary/50 border-border/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="text-center py-20">
                                <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium text-foreground">No projects found</h3>
                                <p className="text-muted-foreground">Try adjusting your search or create a new project.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredProjects.map((project) => (
                                    <div
                                        key={project._id}
                                        className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card hover:bg-card/80 transition-all hover:shadow-lg hover:border-blue-500/30 cursor-pointer"
                                        onClick={() => {
                                            setSelectedProject(project)
                                            setIsDetailDialogOpen(true)
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                        <div className="p-5 flex-1 flex flex-col relative">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 pr-2">
                                                    <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-blue-400 transition-colors">
                                                        {project.name}
                                                    </h3>
                                                    <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(project.status))}>
                                                        {project.status}
                                                    </Badge>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground -mr-2">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                                {project.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {project.techStack?.map(tech => (
                                                    <Badge key={tech} variant="secondary" className="text-[10px] h-5 bg-secondary text-secondary-foreground">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {project.createdBy && typeof project.createdBy !== 'string' && (
                                                <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                                                    <span className="shrink-0">Created by:</span>
                                                    <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-1 rounded-full">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={project.createdBy.avatar} />
                                                            <AvatarFallback className="text-[8px]">
                                                                {project.createdBy.name?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-foreground/80 truncate max-w-[100px]">
                                                            {project.createdBy.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-1 mb-4">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className="font-medium text-foreground">{getProgress(project)}%</span>
                                                </div>
                                                <Progress value={getProgress(project)} className="h-1.5 bg-secondary [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500" />
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex -space-x-2">
                                                    {project.teamMembers?.map((member, index) => (
                                                        <Avatar key={String(member._id || index)} className="h-7 w-7 border-2 border-background ring-1 ring-border/50">
                                                            <AvatarImage src={member.avatar} />
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-[10px] text-white">
                                                                {member.name?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    {project.liveUrl && (
                                                        <div className="flex items-center gap-1 text-green-500" title="Live Link Available">
                                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                            <span className="hidden sm:inline">Live</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1" title="Linked GitHub Repositories">
                                                        <Github className="h-3.5 w-3.5" />
                                                        {project.githubRepos?.length || 0}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {getDaysRemaining(project.endDate)}
                                                    </div>
                                                </div>
                                            </div>

                                            {isMentor && (
                                                <div className="mt-5 pt-3 border-t border-border/40">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 border-blue-500/20"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            router.push(`/projects/${project._id}/report`)
                                                        }}
                                                    >
                                                        <Sparkles className="w-3.5 h-3.5 mr-2" />
                                                        Generate AI Report
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                {/* Create Project Modal */}
                {isDialogOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-background rounded-xl border border-border/50 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 pb-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xl font-bold tracking-tight">Create New Project</h2>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="-mr-2 h-8 w-8 text-muted-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Start a new project to track progress, repositories, and team collaboration.
                                </p>

                                <form onSubmit={handleCreateProject} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Project Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Portfolio Website"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Briefly describe the project goals..."
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="techStack">Tech Stack (comma separated)</Label>
                                        <Input
                                            id="techStack"
                                            value={formData.techStack}
                                            onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                            placeholder="React, Node.js, TypeScript"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="githubUrl">GitHub Repository URL (optional)</Label>
                                        <Input
                                            id="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                            placeholder="https://github.com/username/repo"
                                        />
                                    </div>
                                    {!isMentor && (
                                        <div className="space-y-2">
                                            <Label htmlFor="mentorId">Select Mentor</Label>
                                            <Select
                                                value={formData.mentorId}
                                                onValueChange={(value) => setFormData({ ...formData, mentorId: value })}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a mentor for this project" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mentors.map((mentor) => (
                                                        <SelectItem key={mentor._id} value={mentor._id}>
                                                            {mentor.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="startDate">Start Date</Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="endDate">Target End Date</Label>
                                            <Input
                                                id="endDate"
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 pb-6">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                        <Button
                                            type="submit"
                                            disabled={isCreating}
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                                        >
                                            {isCreating ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Project'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Project Detail Dialog */}
                {isDetailDialogOpen && selectedProject && (
                    <ProjectDetailDialog
                        project={selectedProject}
                        isMentor={isMentor}
                        onClose={() => {
                            setIsDetailDialogOpen(false)
                            setSelectedProject(null)
                        }}
                        onUpdate={(updatedProject) => {
                            setProjects(projects.map(p =>
                                p._id === updatedProject._id ? updatedProject : p
                            ))
                            if (selectedProject && selectedProject._id === updatedProject._id) {
                                setSelectedProject(updatedProject)
                            }
                        }}
                    />
                )}
            </SidebarInset>
        </SidebarProvider>
    )
}

function Search({ className, ...props }: React.ComponentProps<"svg">) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}
