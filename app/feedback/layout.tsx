import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
    title: "AI Feedback - Student Progress",
};

export default function FeedbackLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            {children}
        </div>
    );
}
