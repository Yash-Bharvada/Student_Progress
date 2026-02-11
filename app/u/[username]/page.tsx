"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Calendar, Mail, MapPin, Link as LinkIcon, Loader2, ArrowLeft, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface PublicUser {
    name: string
    username: string
    bio: string
    avatar: string
    role: string
    course: string
    skills: string[]
    joinedAt: string
    email?: string
    githubUrl?: string
}

export default function PublicProfilePage({ params }: { params: { username: string } }) {
    const [user, setUser] = useState<PublicUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/users/${params.username}`)
                const data = await response.json()

                if (data.success) {
                    setUser(data.user)
                } else {
                    setError(data.error)
                }
            } catch (err) {
                setError("Failed to load profile")
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [params.username])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <ShieldAlert className="h-8 w-8 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Profile Unavailable</h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Link href="/dashboard">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Banner */}
            <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                <Link href="/dashboard" className="absolute top-4 left-4">
                    <Button variant="ghost" className="text-white hover:bg-white/20">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            {/* Profile Content */}
            <div className="container max-w-4xl mx-auto px-4 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* User Info Card */}
                    <Card className="w-full md:w-80 shadow-lg border-border/50">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-md mb-4 bg-background">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="text-4xl bg-muted">
                                    {user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                            <p className="text-muted-foreground text-sm mb-4">@{user.username}</p>

                            <Badge variant={user.role === 'mentor' ? 'default' : 'secondary'} className="mb-6 capitalize">
                                {user.role}
                            </Badge>

                            <div className="w-full space-y-3 text-sm text-left border-t pt-6">
                                {user.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{user.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {format(new Date(user.joinedAt), 'MMMM yyyy')}</span>
                                </div>
                                {user.githubUrl && (
                                    <a
                                        href={user.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-500 hover:underline"
                                    >
                                        <Github className="h-4 w-4" />
                                        <span>GitHub Profile</span>
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6 w-full">
                        {/* Bio & Details */}
                        <Card className="shadow-sm border-border/50">
                            <CardHeader className="pb-2">
                                <h2 className="text-lg font-semibold">About</h2>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {user.bio || "No bio provided."}
                                </p>

                                {user.course && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h3 className="text-sm font-medium mb-2">Course</h3>
                                        <p className="text-muted-foreground">{user.course}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        {user.skills && user.skills.length > 0 && (
                            <Card className="shadow-sm border-border/50">
                                <CardHeader className="pb-2">
                                    <h2 className="text-lg font-semibold">Skills</h2>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {user.skills.map((skill) => (
                                            <Badge key={skill} variant="outline" className="px-3 py-1">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
