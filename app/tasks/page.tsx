"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Loader2, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
    _id: string
    title: string
    description: string
    status: 'todo' | 'in-progress' | 'review' | 'done'
    priority: 'low' | 'medium' | 'high'
    dueDate: string
    assignedTo: any
    projectId: any
}

export default function TasksPage() {
    const router = useRouter()
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadTasks()
    }, [])

    const loadTasks = async () => {
        try {
            const authResponse = await fetch('/api/auth/check')
            const authData = await authResponse.json()

            if (!authData.authenticated) {
                router.push('/')
                return
            }

            const response = await fetch('/api/tasks')
            const data = await response.json()

            if (data.success) {
                setTasks(data.tasks)
            }
        } catch (error) {
            console.error('Error loading tasks:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, status: newStatus }),
            })

            const data = await response.json()

            if (data.success) {
                setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus as any } : t))
            }
        } catch (error) {
            console.error('Error updating task:', error)
        }
    }

    const columns = [
        { id: 'todo', title: 'To Do', color: 'from-gray-500 to-slate-500' },
        { id: 'in-progress', title: 'In Progress', color: 'from-blue-500 to-cyan-500' },
        { id: 'review', title: 'Review', color: 'from-amber-500 to-orange-500' },
        { id: 'done', title: 'Done', color: 'from-green-500 to-emerald-500' },
    ]

    const priorityColors = {
        low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        high: "bg-red-500/20 text-red-400 border-red-500/30",
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto">
                    {/* Header */}
                    <div className="relative border-b border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />

                        <div className="relative px-6 py-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                    <CheckSquare className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                        Tasks
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {tasks.length} tasks
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kanban Board */}
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {columns.map((column) => {
                                    const columnTasks = tasks.filter(t => t.status === column.id)

                                    return (
                                        <div key={column.id} className="flex flex-col">
                                            <div className="mb-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r text-white text-sm font-medium",
                                                    column.color
                                                )}>
                                                    {column.title}
                                                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                                        {columnTasks.length}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                {columnTasks.map((task) => (
                                                    <div
                                                        key={task._id}
                                                        className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 hover:shadow-lg hover:border-border transition-all"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                                        <div className="relative">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <h3 className="font-semibold text-foreground text-sm">
                                                                    {task.title}
                                                                </h3>
                                                                <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                                                                    {task.priority}
                                                                </Badge>
                                                            </div>

                                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                                                {task.description}
                                                            </p>

                                                            <div className="flex items-center justify-between text-xs">
                                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                                    <Calendar className="h-3 w-3" />
                                                                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                                                </div>
                                                                {task.assignedTo && (
                                                                    <div className="flex items-center gap-1">
                                                                        <img
                                                                            src={task.assignedTo.avatar}
                                                                            alt={task.assignedTo.name}
                                                                            className="h-5 w-5 rounded-full"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Status Change Buttons */}
                                                            <div className="mt-3 pt-3 border-t border-border/50 flex gap-2">
                                                                {column.id !== 'todo' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            const prevStatus = columns[columns.findIndex(c => c.id === column.id) - 1]?.id
                                                                            if (prevStatus) handleStatusChange(task._id, prevStatus)
                                                                        }}
                                                                        className="text-xs text-muted-foreground hover:text-foreground"
                                                                    >
                                                                        ← Back
                                                                    </button>
                                                                )}
                                                                {column.id !== 'done' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            const nextStatus = columns[columns.findIndex(c => c.id === column.id) + 1]?.id
                                                                            if (nextStatus) handleStatusChange(task._id, nextStatus)
                                                                        }}
                                                                        className="text-xs text-cyan-400 hover:text-cyan-300 ml-auto"
                                                                    >
                                                                        Next →
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {columnTasks.length === 0 && (
                                                    <div className="text-center py-8 text-sm text-muted-foreground">
                                                        No tasks
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
