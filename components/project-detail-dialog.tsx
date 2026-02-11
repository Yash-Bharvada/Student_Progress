import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Github, Loader2, X, ExternalLink, Star } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { updateProjectGithubUrl, syncProjectProgress, addTeamMember, removeTeamMember, searchUsers } from "@/app/projects/actions"

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
    status: 'planning' | 'active' | 'completed' | 'paused'
    startDate: string
    endDate: string
    progress: number
    techStack: string[]
    teamMembers: TeamMember[]
    githubRepos: string[]
    githubUrl?: string
    liveUrl?: string
    lastSynced?: string
    updatedAt: string
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

export function ProjectDetailDialog({
    project,
    isMentor,
    onClose,
    onUpdate
}: {
    project: Project
    isMentor: boolean
    onClose: () => void
    onUpdate: (project: Project) => void
}) {
    const [githubUrl, setGithubUrl] = useState(project.githubUrl || '')
    const [liveUrl, setLiveUrl] = useState(project.liveUrl || '')
    const [isSyncing, setIsSyncing] = useState(false)
    const [isUpdatingUrl, setIsUpdatingUrl] = useState(false)
    const [isUpdatingLiveUrl, setIsUpdatingLiveUrl] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Review State
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoadingReviews, setIsLoadingReviews] = useState(false)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)

    useEffect(() => {
        const fetchReviews = async () => {
            setIsLoadingReviews(true)
            try {
                const res = await fetch(`/api/projects/review?projectId=${project._id}`)
                const data = await res.json()
                if (data.success) {
                    setReviews(data.reviews)
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error)
            } finally {
                setIsLoadingReviews(false)
            }
        }
        fetchReviews()
    }, [project._id])

    const handleUpdateGithubUrl = async () => {
        setIsUpdatingUrl(true)
        try {
            const result = await updateProjectGithubUrl(project._id, githubUrl)
            if (result.success && result.project) {
                onUpdate({ ...project, githubUrl: result.project.githubUrl })
            } else {
                alert(result.error)
            }
        } catch (error) {
            console.error('Error updating GitHub URL:', error)
        } finally {
            setIsUpdatingUrl(false)
        }
    }

    const handleUpdateLiveUrl = async () => {
        setIsUpdatingLiveUrl(true)
        try {
            const res = await fetch(`/api/projects/${project._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ liveUrl })
            })
            const data = await res.json()
            if (data.success) {
                onUpdate(data.project)
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error('Error updating Live URL:', error)
            alert("Failed to update Live URL")
        } finally {
            setIsUpdatingLiveUrl(false)
        }
    }

    const handleSyncProgress = async () => {
        setIsSyncing(true)
        try {
            const result = await syncProjectProgress(project._id)
            if (result.success) {
                onUpdate({ ...project, progress: result.progress ?? 0, lastSynced: result.lastSynced })
            } else {
                alert(result.error)
            }
        } catch (error) {
            console.error('Error syncing progress:', error)
        } finally {
            setIsSyncing(false)
        }
    }

    const handleSearchUsers = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const result = await searchUsers(query)
            if (result.success) {
                setSearchResults(result.users || [])
            }
        } catch (error) {
            console.error('Error searching users:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleAddMember = async (userEmail: string) => {
        try {
            const result = await addTeamMember(project._id, userEmail)
            if (result.success) {
                onUpdate(result.project)
                setSearchQuery('')
                setSearchResults([])
            } else {
                alert(result.error)
            }
        } catch (error) {
            console.error('Error adding team member:', error)
        }
    }

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) return alert("Please select a rating")

        setIsSubmittingReview(true)
        try {
            const res = await fetch('/api/projects/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: project._id,
                    rating,
                    comment
                })
            })
            const data = await res.json()
            if (data.success) {
                setReviews([data.review, ...reviews])
                setRating(0)
                setComment('')
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error("Failed to submit review", error)
        } finally {
            setIsSubmittingReview(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-background rounded-xl border border-border/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 grid md:grid-cols-2 gap-0 overflow-hidden">
                {/* Left Column: Project Details */}
                <div className="p-6 border-r border-border/50 overflow-y-auto max-h-[90vh]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 text-muted-foreground md:hidden"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Links Integration */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <ExternalLink className="h-5 w-5" />
                                Project Links
                            </h3>

                            {/* Live URL */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://my-project.demo.com"
                                    value={liveUrl}
                                    onChange={(e) => setLiveUrl(e.target.value)}
                                    className="flex-1"
                                    readOnly={isMentor}
                                />
                                {!isMentor && (
                                    <Button
                                        onClick={handleUpdateLiveUrl}
                                        disabled={!liveUrl || liveUrl === project.liveUrl || isUpdatingLiveUrl}
                                        size="sm"
                                        variant="outline"
                                    >
                                        {isUpdatingLiveUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                                    </Button>
                                )}
                                {project.liveUrl && (
                                    <Button size="sm" variant="default" asChild>
                                        <a href={project.liveUrl} target="_blank" rel="noreferrer">Visit</a>
                                    </Button>
                                )}
                            </div>

                            {/* GitHub URL */}
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://github.com/username/repo"
                                        value={githubUrl}
                                        onChange={(e) => setGithubUrl(e.target.value)}
                                        className="flex-1"
                                        readOnly={isMentor}
                                    />
                                    {!isMentor && (
                                        <Button
                                            onClick={handleUpdateGithubUrl}
                                            disabled={isUpdatingUrl || !githubUrl}
                                            size="sm"
                                            variant="outline"
                                        >
                                            {isUpdatingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Link'}
                                        </Button>
                                    )}
                                    {project.githubUrl && (
                                        <Button size="sm" variant="default" asChild>
                                            <a href={project.githubUrl} target="_blank" rel="noreferrer">
                                                <Github className="h-4 w-4 mr-2" />
                                                Repo
                                            </a>
                                        </Button>
                                    )}
                                </div>

                                {project.githubUrl && (
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                        <div>
                                            <div className="text-sm font-medium">Progress: {project.progress || 0}%</div>
                                            {project.lastSynced && (
                                                <div className="text-xs text-muted-foreground">
                                                    Last synced: {new Date(project.lastSynced).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                        {!isMentor && (
                                            <Button
                                                onClick={handleSyncProgress}
                                                disabled={isSyncing}
                                                size="sm"
                                            >
                                                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Sync
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Members */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Team Members</h3>

                            {/* Search and Add */}
                            {!isMentor && (
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value)
                                            handleSearchUsers(e.target.value)
                                        }}
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                                            {searchResults.map((user) => (
                                                <div key={user._id} className="p-2 flex items-center justify-between hover:bg-secondary/50">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={user.avatar} />
                                                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="text-sm font-medium">{user.name}</div>
                                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAddMember(user.email)}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Current Members */}
                            <div className="space-y-2">
                                {project.teamMembers?.map((member) => (
                                    <div key={member._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{member.name}</div>
                                                <div className="text-sm text-muted-foreground">{member.email}</div>
                                            </div>
                                        </div>
                                        {!isMentor && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={async () => {
                                                    const result = await removeTeamMember(project._id, member._id)
                                                    if (result.success) onUpdate(result.project)
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Reviews & Feedback */}
                <div className="p-6 bg-secondary/10 overflow-y-auto max-h-[90vh] flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                        <h2 className="text-xl font-bold tracking-tight">Mentor Feedback</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 text-muted-foreground hidden md:flex"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 space-y-4">
                        {reviews.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>No reviews yet.</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review._id} className="bg-card p-4 rounded-lg border border-border/50 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={review.mentorId?.avatar} />
                                                <AvatarFallback>{review.mentorId?.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{review.mentorId?.name}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`h-4 w-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-foreground/80">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {isMentor && (
                        <div className="mt-6 pt-6 border-t border-border/50">
                            <h3 className="text-sm font-semibold mb-3">Add Review</h3>
                            <form onSubmit={handleSubmitReview} className="space-y-3">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`h-6 w-6 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <Textarea
                                    placeholder="Write your feedback here..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    className="min-h-[80px]"
                                />
                                <Button
                                    type="submit"
                                    disabled={isSubmittingReview || rating === 0}
                                    className="w-full"
                                >
                                    {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
