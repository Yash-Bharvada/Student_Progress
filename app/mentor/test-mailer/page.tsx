"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"

export default function TestMailerPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; projectsProcessed?: number } | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/user');
                const data = await response.json();
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    const triggerDeadlineCheck = async () => {
        setIsLoading(true);
        setResult(null);

        if (!user) {
            setResult({ success: false, message: "User session not found. Please log in." });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/send-reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mentorId: user._id || user.id,
                    mentorName: user.name || user.username || "Your Mentor"
                }),
            });
            const data = await response.json();

            setResult(data);
        } catch (error: any) {
            setResult({
                success: false,
                message: error.message || "An error occurred while connecting to the server."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto p-6">
                    <div className="container mx-auto py-10 max-w-2xl">
                        <Card className="shadow-lg border-2 border-indigo-50/50">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-800">Deadline Mailer Dashboard</CardTitle>
                                        <CardDescription className="text-gray-600 mt-1">
                                            Showcase the automated deadline checking and email dispatch system.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-4 rounded-lg border text-sm text-slate-700 leading-relaxed">
                                        <p className="font-semibold mb-2">How it works:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>The system searches for active/planning projects with a deadline in exactly 1-2 days.</li>
                                            <li>It verifies whether an alert has already been sent to prevent spam.</li>
                                            <li>If valid, it extracts all student team members associated with the project.</li>
                                            <li>It explicitly fires an HTML-formatted email to each student via <strong>Gmail SMTP</strong>.</li>
                                            <li>It marks <code>deadlineWarningSent</code> as true in the database.</li>
                                        </ul>
                                    </div>

                                    {result && (
                                        <div className={`p-4 rounded-lg border flex items-start gap-3 ${result.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                                            {result.success ? <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600" /> : <AlertCircle className="w-5 h-5 mt-0.5 text-red-600" />}
                                            <div>
                                                <h4 className="font-semibold">{result.success ? "Execution Successful" : "Execution Failed"}</h4>
                                                <p className="text-sm mt-1">{result.message}</p>
                                                {result.projectsProcessed !== undefined && (
                                                    <p className="text-sm mt-1 font-medium">Projects Processed: {result.projectsProcessed}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50 border-t p-6 flex justify-end">
                                <Button
                                    onClick={triggerDeadlineCheck}
                                    disabled={isLoading}
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all active:scale-95"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing Deadlines...
                                        </>
                                    ) : (
                                        <>
                                            Trigger Deadline Checks Now
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
