"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
    FolderGit2,
    Calendar,
    Users,
    MessageSquare,
    CheckSquare,
    Github,
    Loader2,
    Plus,
    Trash2,
    Send
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types (should ideally be shared)
interface User {
    _id: string
    name: string
    avatar: string
    email: string
    role: string
}

interface Milestone {
    _id: string
    name: string
    description: string
    dueDate: string
    status: 'pending' | 'in-progress' | 'completed'
}

interface Feedback {
    _id: string
    content: string
    type: 'comment' | 'review' | 'evaluation'
    mentorId: User
    createdAt: string
}

interface Project {
    _id: string
    name: string
    description: string
    status: string
    startDate: string
    endDate: string
    techStack: string[]
    teamMembers: User[]
    mentorId: User
    githubRepos: string[]
    createdBy: string // ID
}

export default function ProjectDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [project, setProject] = useState<Project | null>(null)
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'milestones' | 'feedback'>('overview')
    const [currentUser, setCurrentUser] = useState<User | null>(null)

    // Form states
    const [newMemberEmail, setNewMemberEmail] = useState('')
    const [addingMember, setAddingMember] = useState(false)

    const [newMilestone, setNewMilestone] = useState({ name: '', description: '', dueDate: '' })
    const [addingMilestone, setAddingMilestone] = useState(false)

    const [newFeedback, setNewFeedback] = useState('')
    const [submittingFeedback, setSubmittingFeedback] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            try {
                // Auth Check
                const authRes = await fetch('/api/auth/check')
                const authData = await authRes.json()
                if (!authData.authenticated) {
                    router.push('/')
                    return
                }
                setCurrentUser(authData.user)

                // Load Project
                const pRes = await fetch(`/api/projects/${id}`)
                const pData = await pRes.json()

                if (!pData.success) {
                    // Handle error (e.g., project not found or forbidden)
                    router.push('/projects')
                    return
                }
                setProject(pData.project)

                // Load Milestones
                const mRes = await fetch(`/api/projects/${id}/milestones`)
                const mData = await mRes.json()
                if (mData.success) setMilestones(mData.milestones)

                // Load Feedback
                const fRes = await fetch(`/api/projects/${id}/feedback`)
                const fData = await fRes.json()
                if (fData.success) setFeedbackList(fData.feedback)

            } catch (error) {
                console.error('Error loading project details', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id, router])

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddingMember(true)
        try {
            const res = await fetch(`/api/projects/${id}/team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newMemberEmail })
            })
            const data = await res.json()
            if (data.success) {
                setProject(prev => prev ? { ...prev, teamMembers: [...prev.teamMembers, data.member] } : null)
                setNewMemberEmail('')
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setAddingMember(false)
        }
    }

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return
        try {
            const res = await fetch(`/api/projects/${id}/team`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId })
            })
            if (res.ok) {
                setProject(prev => prev ? { ...prev, teamMembers: prev.teamMembers.filter(m => m._id !== memberId) } : null)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleAddMilestone = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddingMilestone(true)
        try {
            const res = await fetch(`/api/projects/${id}/milestones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newMilestone, order: milestones.length + 1 })
            })
            const data = await res.json()
            if (data.success) {
                setMilestones([...milestones, data.milestone])
                setNewMilestone({ name: '', description: '', dueDate: '' })
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setAddingMilestone(false)
        }
    }

    const handleAddFeedback = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmittingFeedback(true)
        try {
            const res = await fetch(`/api/projects/${id}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newFeedback, type: 'comment' })
            })
            const data = await res.json()
            if (data.success) {
                // We need the populated mentor info, but API returns just the feedback object, likely with only ID.
                // For simplicity, let's manually construct it for UI update or re-fetch.
                // Let's re-fetch or optimistically update if we had full user object.
                // We have currentUser!
                if (currentUser) {
                    const newFeedbackItem: Feedback = {
                        ...data.feedback,
                        mentorId: currentUser
                    }
                    setFeedbackList([newFeedbackItem, ...feedbackList])
                }
                setNewFeedback('')
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSubmittingFeedback(false)
        }
    }

    // Handlers for Milestone status toggle could be added here (PATCH)

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!project) return null

    const isOwner = currentUser?._id === project.createdBy
    const isMentor = currentUser?.role === 'mentor'

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto p-6">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                                <Badge variant="outline" className="capitalize">{project.status}</Badge>
                            </div>
                            <p className="text-muted-foreground max-w-2xl">{project.description}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {project.techStack?.map(tech => (
                                    <Badge key={tech} variant="secondary">{tech}</Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right text-sm text-muted-foreground">
                                <div>Deadline</div>
                                <div className="font-medium text-foreground">{new Date(project.endDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-border/50 mb-6">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={cn("pb-3 text-sm font-medium transition-colors border-b-2", activeTab === 'overview' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('team')}
                                className={cn("pb-3 text-sm font-medium transition-colors border-b-2", activeTab === 'team' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                            >
                                Team
                            </button>
                            <button
                                onClick={() => setActiveTab('milestones')}
                                className={cn("pb-3 text-sm font-medium transition-colors border-b-2", activeTab === 'milestones' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                            >
                                Milestones
                            </button>
                            <button
                                onClick={() => setActiveTab('feedback')}
                                className={cn("pb-3 text-sm font-medium transition-colors border-b-2", activeTab === 'feedback' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                            >
                                Feedback
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                        {activeTab === 'overview' && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="rounded-xl border border-border/50 bg-card p-6">
                                    <h3 className="font-semibold mb-4">Progress</h3>
                                    {/* Calculate real progress based on milestones? */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Milestones Completed</span>
                                            <span>
                                                {milestones.filter(m => m.status === 'completed').length} / {milestones.length}
                                            </span>
                                        </div>
                                        <Progress value={milestones.length > 0 ? (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100 : 0} className="h-2" />
                                    </div>
                                </div>
                                <div className="rounded-xl border border-border/50 bg-card p-6">
                                    <h3 className="font-semibold mb-4">Details</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between py-2 border-b border-border/50">
                                            <span className="text-muted-foreground">Start Date</span>
                                            <span>{new Date(project.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-border/50">
                                            <span className="text-muted-foreground">Mentor</span>
                                            <span>{project.mentorId?.name || 'Unassigned'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-border/50">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="capitalize">{project.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div className="space-y-6">
                                {isOwner && (
                                    <div className="rounded-xl border border-border/50 bg-card p-6">
                                        <h3 className="font-semibold mb-4">Add Team Member</h3>
                                        <form onSubmit={handleAddMember} className="flex gap-3">
                                            <Input
                                                placeholder="Enter student email"
                                                value={newMemberEmail}
                                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                                className="max-w-md"
                                                required
                                            />
                                            <Button type="submit" disabled={addingMember}>
                                                {addingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                                                Add Member
                                            </Button>
                                        </form>
                                    </div>
                                )}

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {project.teamMembers.map((member) => (
                                        <div key={member._id} className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4">
                                            <Avatar>
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-medium truncate">{member.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                            </div>
                                            {isOwner && member._id !== currentUser?._id && (
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member._id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'milestones' && (
                            <div className="space-y-6">
                                {isOwner && (
                                    <div className="rounded-xl border border-border/50 bg-card p-6">
                                        <h3 className="font-semibold mb-4">Add Milestone</h3>
                                        <form onSubmit={handleAddMilestone} className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <Input
                                                    placeholder="Milestone Title"
                                                    value={newMilestone.name}
                                                    onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                                                    required
                                                />
                                                <Input
                                                    type="date"
                                                    value={newMilestone.dueDate}
                                                    onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <Textarea
                                                placeholder="Description"
                                                value={newMilestone.description}
                                                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                                required
                                            />
                                            <Button type="submit" disabled={addingMilestone}>
                                                {addingMilestone ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                                                Create Milestone
                                            </Button>
                                        </form>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {milestones.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground">No milestones yet.</div>
                                    ) : (
                                        milestones.map((milestone) => (
                                            <div key={milestone._id} className="rounded-xl border border-border/50 bg-card p-6">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-lg">{milestone.name}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                                                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <Badge className={cn(
                                                        milestone.status === 'completed' ? 'bg-green-500/20 text-green-600' :
                                                            milestone.status === 'in-progress' ? 'bg-blue-500/20 text-blue-600' :
                                                                'bg-gray-500/20 text-gray-600'
                                                    )}>
                                                        {milestone.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'feedback' && (
                            <div className="space-y-6">
                                {isMentor && (
                                    <div className="rounded-xl border border-border/50 bg-card p-6">
                                        <h3 className="font-semibold mb-4">Add Feedback</h3>
                                        <form onSubmit={handleAddFeedback} className="space-y-4">
                                            <Textarea
                                                placeholder="Write your feedback..."
                                                value={newFeedback}
                                                onChange={(e) => setNewFeedback(e.target.value)}
                                                rows={4}
                                                required
                                            />
                                            <Button type="submit" disabled={submittingFeedback}>
                                                {submittingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                                Post Feedback
                                            </Button>
                                        </form>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {feedbackList.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground">No feedback yet.</div>
                                    ) : (
                                        feedbackList.map((item) => (
                                            <div key={item._id} className="flex gap-4">
                                                <Avatar>
                                                    <AvatarImage src={item.mentorId.avatar} />
                                                    <AvatarFallback>{item.mentorId.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-2">
                                                    <div className="rounded-xl border border-border/50 bg-card p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-semibold text-sm">{item.mentorId.name}</span>
                                                            <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm">{item.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
