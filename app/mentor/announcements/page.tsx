"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Megaphone, Send, History } from "lucide-react"
import { toast } from "sonner"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    content: z.string().min(10, {
        message: "Content must be at least 10 characters.",
    }),
})

interface Announcement {
    _id: string
    title: string
    content: string
    createdAt: string
    authorId: {
        _id: string
        name: string
        email: string
    }
}

export default function AnnouncementsPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [announcements, setAnnouncements] = useState<Announcement[]>([])

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
        },
    })

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/mentor/announcements')
            const data = await res.json()
            if (data.success) {
                setAnnouncements(data.announcements)
            }
        } catch (error) {
            console.error("Error fetching announcements:", error)
            toast.error("Failed to load past announcements")
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const res = await fetch('/api/mentor/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to post announcement")
            }

            toast.success("Announcement posted successfully", {
                description: "All students will be notified shortly."
            })

            reset()
            fetchAnnouncements()

        } catch (error) {
            console.error("Error posting announcement:", error)
            toast.error("Failed to post announcement", {
                description: error instanceof Error ? error.message : "Something went wrong"
            })
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
                    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                            <p className="text-muted-foreground">
                                Create new announcements to notify all enrolled students.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Create Announcement Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Megaphone className="h-5 w-5 text-primary" />
                                        New Announcement
                                    </CardTitle>
                                    <CardDescription>
                                        This will send a notification to all students.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Title</Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g., Upcoming Hackathon Details"
                                                {...register("title")}
                                            />
                                            {errors.title && (
                                                <p className="text-sm font-medium text-destructive">{errors.title.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="content">Content</Label>
                                            <Textarea
                                                id="content"
                                                placeholder="Enter your announcement details here..."
                                                className="min-h-[150px] resize-y"
                                                {...register("content")}
                                            />
                                            {errors.content && (
                                                <p className="text-sm font-medium text-destructive">{errors.content.message}</p>
                                            )}
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Posting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Post Announcement
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* History Section */}
                            <Card className="h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="h-5 w-5 text-primary" />
                                        Recent History
                                    </CardTitle>
                                    <CardDescription>
                                        View previously sent announcements.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 min-h-0">
                                    <ScrollArea className="h-[500px] pr-4">
                                        {isFetching ? (
                                            <div className="space-y-4">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="flex flex-col gap-2 p-4 border rounded-lg">
                                                        <Skeleton className="h-4 w-3/4" />
                                                        <Skeleton className="h-3 w-1/2" />
                                                        <Skeleton className="h-16 w-full mt-2" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : announcements.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center">
                                                <History className="h-8 w-8 mb-2 opacity-20" />
                                                <p>No announcements yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {announcements.map((announcement) => (
                                                    <div
                                                        key={announcement._id}
                                                        className="flex flex-col gap-2 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-card-foreground"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-semibold">{announcement.title}</h3>
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                                {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                                                            {announcement.content}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t text-xs text-muted-foreground">
                                                            <span>Posted by {announcement.authorId?.name || "Unknown"}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
