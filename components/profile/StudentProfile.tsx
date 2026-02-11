"use client"

import { useState } from "react"
import { IUser } from "@/lib/models/User"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Github, Save, Loader2, BookOpen, Calendar, Code, X, Plus } from "lucide-react"
import { format } from "date-fns"

interface StudentProfileProps {
    user: IUser & { _id: string }
}

export function StudentProfile({ user }: StudentProfileProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [newSkill, setNewSkill] = useState("")
    const [formData, setFormData] = useState({
        name: user.name,
        bio: user.bio || "",
        githubUsername: user.username || "",
        course: user.course || "",
        skills: user.skills || []
    })

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                setIsEditing(false)
                window.location.reload()
            }
        } catch (error) {
            console.error("Failed to update profile", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddSkill = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, newSkill.trim()]
            })
            setNewSkill("")
        }
    }

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(skill => skill !== skillToRemove)
        })
    }

    return (
        <div className="space-y-6">
            <Card className="border-l-4 border-l-blue-500 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 -z-10" />
                <CardContent className="pt-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        {user.name}
                                        <Badge variant="secondary" className="capitalize bg-blue-100 text-blue-700 hover:bg-blue-100/80">Student</Badge>
                                    </h2>
                                    <p className="text-muted-foreground">{user.email}</p>
                                </div>
                                <Button
                                    variant={isEditing ? "default" : "outline"}
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    disabled={isLoading}
                                    size="sm"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isEditing ? (
                                        <>
                                            <Save className="h-4 w-4 mr-2" /> Save Changes
                                        </>
                                    ) : (
                                        "Edit Profile"
                                    )}
                                </Button>
                            </div>

                            {isEditing ? (
                                <div className="grid gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Tell us about yourself..."
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl bg-secondary/20 p-3 rounded-lg border border-border/50">
                                    {user.bio || "No bio provided yet."}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            Hackathon Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground">Focus Area</span>
                            {isEditing ? (
                                <Input
                                    value={formData.course}
                                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                    placeholder="e.g. AI/ML, Frontend, Blockchain"
                                    className="max-w-[200px] h-8"
                                />
                            ) : (
                                <span className="text-sm font-medium">{user.course || "General"}</span>
                            )}
                        </div>
                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Joined
                            </span>
                            <span className="text-sm font-medium">
                                {user.enrollmentDate ? format(new Date(user.enrollmentDate), 'MMMM d, yyyy') : "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Github className="h-4 w-4" /> GitHub
                            </span>
                            {isEditing ? (
                                <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground text-xs">@</span>
                                    <Input
                                        value={formData.githubUsername}
                                        onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                                        placeholder="username"
                                        className="max-w-[150px] h-8"
                                    />
                                </div>
                            ) : (
                                user.username ? (
                                    <a
                                        href={`https://github.com/${user.username}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-medium text-blue-500 hover:underline flex items-center gap-1"
                                    >
                                        @{user.username}
                                    </a>
                                ) : (
                                    <span className="text-sm text-muted-foreground">Not linked</span>
                                )
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Code className="h-5 w-5 text-purple-500" />
                            Skills & Interests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isEditing && (
                            <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                                <Input
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Add a skill (e.g. React, Python)"
                                    className="h-8"
                                />
                                <Button type="submit" size="sm" variant="secondary" className="h-8">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </form>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {formData.skills && formData.skills.length > 0 ? (
                                formData.skills.map((skill, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="px-3 py-1 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 flex items-center gap-1"
                                    >
                                        {skill}
                                        {isEditing && (
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-red-500"
                                                onClick={() => handleRemoveSkill(skill)}
                                            />
                                        )}
                                    </Badge>
                                ))
                            ) : (
                                <div className="text-center w-full py-8 text-muted-foreground bg-secondary/10 rounded-lg border border-dashed">
                                    <p className="text-sm">No skills added yet.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
