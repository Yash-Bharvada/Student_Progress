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
import { Loader2, UserPlus, Shield, Trash2 } from "lucide-react"

export default function AdminPage() {
    const router = useRouter()
    const [mentors, setMentors] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newMentor, setNewMentor] = useState({ name: '', email: '', password: '' })
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        fetchMentors()
    }, [])

    const fetchMentors = async () => {
        try {
            // Check auth first
            const authRes = await fetch('/api/auth/check')
            const authData = await authRes.json()

            if (!authData.authenticated) {
                router.push('/')
                return
            }

            if (authData.user.role !== 'admin') {
                router.push('/') // Or respective dashboard
                return
            }

            const res = await fetch('/api/admin/mentors')
            const data = await res.json()
            if (data.success) {
                setMentors(data.mentors)
            } else {
                // Redirect if unauthorized
                if (res.status === 401) router.push('/')
            }
        } catch (error) {
            console.error('Failed to fetch mentors', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateMentor = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)
        try {
            const res = await fetch('/api/admin/mentors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMentor)
            })
            const data = await res.json()
            if (data.success) {
                setMentors([data.mentor, ...mentors])
                setNewMentor({ name: '', email: '', password: '' })
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error('Failed to create mentor', error)
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteMentor = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mentor?')) return

        try {
            const res = await fetch(`/api/admin/mentors?id=${id}`, {
                method: 'DELETE',
            })
            const data = await res.json()
            if (data.success) {
                setMentors(mentors.filter(m => m._id !== id))
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error('Failed to delete mentor', error)
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
                            <Shield className="h-8 w-8 text-primary" />
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground">Manage mentors and system settings.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Create Mentor Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    Add New Mentor
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateMentor} className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Full Name"
                                            value={newMentor.name}
                                            onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            type="email"
                                            placeholder="Email Address"
                                            value={newMentor.email}
                                            onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            value={newMentor.password}
                                            onChange={(e) => setNewMentor({ ...newMentor, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={isCreating} className="w-full">
                                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Create Mentor Account
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Mentors List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Mentors ({mentors.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : mentors.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No mentors found.</p>
                                ) : (
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {mentors.map((mentor) => (
                                            <div key={mentor._id} className="flex items-center gap-4 p-3 rounded-lg border bg-card/50">
                                                <Avatar>
                                                    <AvatarImage src={mentor.avatar} />
                                                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{mentor.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{mentor.email}</p>
                                                </div>
                                                <Badge variant="secondary">Mentor</Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                    onClick={() => handleDeleteMentor(mentor._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider >
    )
}
