"use client"

import { IUser } from "@/lib/models/User"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, LayoutDashboard, Users, UserPlus } from "lucide-react"
import Link from "next/link"

interface AdminProfileProps {
    user: IUser & { _id: string }
}

export function AdminProfile({ user }: AdminProfileProps) {
    return (
        <div className="space-y-6">
            <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-background to-red-500/5">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                                {user.name}
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" /> Admin
                                </Badge>
                            </h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <p className="text-sm mt-2 max-w-xl mx-auto md:mx-0">
                                You have full access to manage users, courses, and system settings.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button asChild>
                                <Link href="/admin">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin'}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">User Management</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Manage</div>
                        <p className="text-xs text-muted-foreground">
                            View and edit all users
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin?action=invite'}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invite Users</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Invite</div>
                        <p className="text-xs text-muted-foreground">
                            Add new mentors or admins
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/settings'}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Settings</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Configure</div>
                        <p className="text-xs text-muted-foreground">
                            Global platform settings
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
