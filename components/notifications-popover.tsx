"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Loader2, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Notification {
    _id: string
    title: string
    message: string
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
    read: boolean
    createdAt: string
    link?: string
}

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

    // Poll for notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications')
                const data = await res.json()
                if (data.success) {
                    setNotifications(data.notifications)
                    setUnreadCount(data.unreadCount)
                }
            } catch (error) {
                console.error("Error fetching notifications:", error)
            }
        }

        fetchNotifications()
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id })
            })

            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, read: true } : n
            ))

            // Re-calculate unread count locally to assume success
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', { method: 'PATCH' })
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Error marking notifications as read:", error)
        }
    }

    const handleNotificationClick = async (notification: Notification) => {
        setSelectedNotification(notification)
        if (!notification.read) {
            await markAsRead(notification._id)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'WARNING': return <AlertTriangle className="h-5 w-5 text-amber-500" />
            case 'ERROR': return <XCircle className="h-5 w-5 text-red-500" />
            default: return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
                    >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={markAllAsRead}
                            >
                                <Check className="mr-1 h-3 w-3" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                    <ScrollArea className="h-[300px]">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                                <Bell className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {notifications.map((notification) => (
                                    <button
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "flex flex-col gap-1 p-4 w-full text-left transition-colors hover:bg-muted/50 focus:outline-none focus:bg-muted/50",
                                            !notification.read && "bg-muted/20"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2 w-full">
                                            <div className="flex items-center gap-2">
                                                {getIcon(notification.type)}
                                                <span className={cn("text-sm font-medium leading-none", !notification.read && "text-foreground")}>
                                                    {notification.title}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground shrink-0">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-snug pl-7 line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedNotification && getIcon(selectedNotification.type)}
                            {selectedNotification?.title}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedNotification && formatDistanceToNow(new Date(selectedNotification.createdAt), { addSuffix: true })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                            {selectedNotification?.message}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setSelectedNotification(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
