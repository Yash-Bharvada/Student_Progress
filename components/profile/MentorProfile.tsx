"use client"

import { IUser } from "@/lib/models/User"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Mail, ExternalLink, GraduationCap } from "lucide-react"

interface MentorProfileProps {
    user: IUser & { _id: string }
    mentees: (IUser & { _id: string })[]
}

export function MentorProfile({ user, mentees }: MentorProfileProps) {
    return (
        <div className="space-y-6">
            <Card className="border-l-4 border-l-purple-500 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 -z-10" />
                <CardContent className="pt-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    {user.name}
                                    <Badge variant="secondary" className="capitalize bg-purple-100 text-purple-700 hover:bg-purple-100/80">Mentor</Badge>
                                </h2>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>

                            <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl bg-secondary/20 p-3 rounded-lg border border-border/50">
                                {user.bio || "No bio provided yet."}
                            </p>

                            <div className="flex gap-2 mt-4">
                                {user.skills?.map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[150px]">
                            <Card className="bg-secondary/30 border-none shadow-none">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <Users className="h-6 w-6 text-purple-500 mb-1" />
                                    <span className="text-2xl font-bold">{mentees.length}</span>
                                    <span className="text-xs text-muted-foreground">Mentees</span>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-purple-500" />
                        Mentorship Group
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {mentees.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {mentees.map((mentee) => (
                                <div key={mentee._id} className="flex items-center gap-4 p-4 rounded-xl border bg-card/50 hover:bg-secondary/20 transition-colors">
                                    <Avatar>
                                        <AvatarImage src={mentee.avatar} />
                                        <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{mentee.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{mentee.email}</p>
                                        <p className="text-xs text-muted-foreground truncate mt-1">
                                            {mentee.course || "No Course"}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No students assigned yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
