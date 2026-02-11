import { getCurrentUser } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import { UserModel } from "@/lib/models/User" // This import might be needed for queries, though getCurrentUser returns user
import { StudentProfile } from "@/components/profile/StudentProfile"
import { MentorProfile } from "@/components/profile/MentorProfile"
import { AdminProfile } from "@/components/profile/AdminProfile"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"

export default async function ProfilePage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/")
    }

    // Connect DB to fetch additional data if needed
    await dbConnect()

    // Serialize user data for client components
    const serializedUser = JSON.parse(JSON.stringify(user))
    let additionalData: any = {}

    if (user.role === 'mentor') {
        const mentees = await UserModel.find({ mentorId: user._id }).select('-password').lean()
        additionalData.mentees = JSON.parse(JSON.stringify(mentees))
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">My Profile</h1>
                        <p className="text-muted-foreground">Manage your personal information and settings.</p>
                    </div>

                    {user.role === 'student' && <StudentProfile user={serializedUser} />}
                    {user.role === 'mentor' && <MentorProfile user={serializedUser} mentees={additionalData.mentees || []} />}
                    {user.role === 'admin' && <AdminProfile user={serializedUser} />}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
