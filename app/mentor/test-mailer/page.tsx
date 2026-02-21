"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    Mail,
    Send,
    Clock,
    FolderOpen,
    Users,
    Bell,
    RefreshCw,
    Calendar,
} from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, TopBar } from "@/components/app-sidebar";

type RunLog = {
    timestamp: string;
    status: "success" | "error" | "info";
    message: string;
    projectsProcessed?: number;
    notificationsSent?: number;
};

export default function EmailNotificationCenter() {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [logs, setLogs] = useState<RunLog[]>([]);
    const [lastRun, setLastRun] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("/api/user");
                const data = await response.json();
                if (data.success) setUser(data.user);
            } catch { }
        };
        fetchUser();

        // Load persisted logs from sessionStorage
        const saved = sessionStorage.getItem("mailer-logs");
        if (saved) setLogs(JSON.parse(saved));
        const savedRun = sessionStorage.getItem("mailer-last-run");
        if (savedRun) setLastRun(savedRun);
    }, []);

    const addLog = (log: RunLog) => {
        setLogs((prev) => {
            const updated = [log, ...prev].slice(0, 20);
            sessionStorage.setItem("mailer-logs", JSON.stringify(updated));
            return updated;
        });
    };

    const triggerDeadlineCheck = async () => {
        if (!user) return;
        setIsLoading(true);

        addLog({
            timestamp: new Date().toLocaleTimeString(),
            status: "info",
            message: "Scanning for projects with approaching deadlines...",
        });

        try {
            const response = await fetch("/api/send-reminders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mentorId: user._id || user.id,
                    mentorName: user.name || user.username || "Your Mentor",
                }),
            });
            const data = await response.json();

            const now = new Date().toLocaleTimeString();
            setLastRun(now);
            sessionStorage.setItem("mailer-last-run", now);

            if (data.success) {
                addLog({
                    timestamp: now,
                    status: "success",
                    message: data.message,
                    projectsProcessed: data.projectsProcessed,
                    notificationsSent: data.projectsProcessed,
                });
            } else {
                addLog({
                    timestamp: now,
                    status: "error",
                    message: data.error || data.message || "Run failed.",
                });
            }
        } catch (error: any) {
            addLog({
                timestamp: new Date().toLocaleTimeString(),
                status: "error",
                message: error.message || "Network error.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const clearLogs = () => {
        setLogs([]);
        sessionStorage.removeItem("mailer-logs");
    };

    const totalSent = logs
        .filter((l) => l.status === "success")
        .reduce((a, l) => a + (l.notificationsSent || 0), 0);
    const totalRuns = logs.filter((l) => l.status !== "info").length;
    const successRuns = logs.filter((l) => l.status === "success").length;

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto p-6 md:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Email Notification Center</h1>
                                <p className="text-sm text-muted-foreground">
                                    Deadline reminders · Auto dispatch · Real-time logs
                                </p>
                            </div>
                            <Badge variant="secondary" className="ml-auto bg-blue-500/10 text-blue-500 border-blue-500/20">
                                Mentor Module
                            </Badge>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            {
                                icon: Send,
                                label: "Emails Sent",
                                value: totalSent,
                                color: "text-blue-500",
                                bg: "bg-blue-500/10",
                            },
                            {
                                icon: RefreshCw,
                                label: "Total Runs",
                                value: totalRuns,
                                color: "text-indigo-500",
                                bg: "bg-indigo-500/10",
                            },
                            {
                                icon: CheckCircle2,
                                label: "Successful",
                                value: successRuns,
                                color: "text-green-500",
                                bg: "bg-green-500/10",
                            },
                            {
                                icon: Clock,
                                label: "Last Run",
                                value: lastRun || "Never",
                                color: "text-orange-500",
                                bg: "bg-orange-500/10",
                                small: true,
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-3"
                            >
                                <div className={`rounded-lg p-2 ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    <p className={`font-bold ${stat.small ? "text-sm" : "text-xl"} text-foreground`}>
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Config + Trigger */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* System Config Card */}
                            <div className="rounded-xl border border-border/50 bg-card p-5">
                                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-blue-500" />
                                    System Configuration
                                </h2>
                                <div className="space-y-3 text-sm">
                                    {[
                                        { label: "Trigger", value: "Manual / Cron (Daily 9AM)" },
                                        { label: "Window", value: "Projects due in 1–2 days" },
                                        { label: "Transport", value: "Gmail SMTP" },
                                        { label: "Anti-spam", value: "One alert per project" },
                                        { label: "Scope", value: "Your assigned projects only" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
                                            <span className="text-muted-foreground">{label}</span>
                                            <span className="font-medium text-foreground text-xs text-right max-w-[55%]">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trigger Card */}
                            <div className="rounded-xl border border-border/50 bg-card p-5">
                                <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    Manual Trigger
                                </h2>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Run the deadline scan immediately for your projects.
                                </p>
                                <Button
                                    onClick={triggerDeadlineCheck}
                                    disabled={isLoading || !user}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Run Deadline Check
                                        </>
                                    )}
                                </Button>
                                {!user && (
                                    <p className="text-xs text-muted-foreground mt-2 text-center">
                                        Loading session...
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right: Run Log */}
                        <div className="lg:col-span-2">
                            <div className="rounded-xl border border-border/50 bg-card h-full flex flex-col">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                                    <h2 className="text-sm font-semibold flex items-center gap-2">
                                        <FolderOpen className="h-4 w-4 text-blue-500" />
                                        Run Log
                                    </h2>
                                    {logs.length > 0 && (
                                        <button
                                            onClick={clearLogs}
                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[420px]">
                                    {logs.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                                            <Users className="h-8 w-8 opacity-30" />
                                            <p className="text-sm">No runs yet. Trigger a check to see logs here.</p>
                                        </div>
                                    ) : (
                                        logs.map((log, i) => (
                                            <div
                                                key={i}
                                                className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm border ${log.status === "success"
                                                        ? "bg-green-500/5 border-green-500/20"
                                                        : log.status === "error"
                                                            ? "bg-red-500/5 border-red-500/20"
                                                            : "bg-blue-500/5 border-blue-500/10"
                                                    }`}
                                            >
                                                <div className="mt-0.5 shrink-0">
                                                    {log.status === "success" ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : log.status === "error" ? (
                                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-foreground leading-snug">{log.message}</p>
                                                    {log.projectsProcessed !== undefined && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {log.projectsProcessed} project(s) processed
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                                                    {log.timestamp}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
