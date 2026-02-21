import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { ProjectModel } from "@/lib/models/Project";
import { getCurrentUser } from "@/lib/auth";
import { generateProjectReport } from "@/lib/gemini";
import { analyzeRepository } from "@/lib/github";

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Note: params must be awaited in Next.js 15+ App Router
) {
    try {
        await dbConnect();
        const user = await getCurrentUser();

        if (!user || user.role !== 'mentor') {
            return NextResponse.json({ success: false, error: 'Unauthorized. Only mentors can generate AI Reports.' }, { status: 403 });
        }

        const params = await context.params;
        const projectId = params.id;

        const project = await ProjectModel.findById(projectId)
            .populate('teamMembers', 'name email username avatar')
            .lean();

        if (!project) {
            return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
        }

        // Verify Mentor owns this project
        if (project.mentorId?.toString() !== user._id.toString()) {
            return NextResponse.json({ success: false, error: 'You are not the mentor for this project.' }, { status: 403 });
        }

        let githubDetails = null;

        // Try to fetch GitHub data if a URL is attached to provide the AI with richer context
        if (project.githubUrl) {
            try {
                // Determine user Github access token (simplified for brevity, usually stored in DB)
                // If the user's githubAccessToken is not attached in the DB, the service will try a public scrape.
                const token = user.githubAccessToken;
                if (token) {
                    githubDetails = await analyzeRepository(project.githubUrl, token);
                }
            } catch (err) {
                console.warn("Could not fetch detailed Github analytics for report.", err);
                // We proceed anyway, passing null for GitHub details
            }
        }

        const reportMarkdown = await generateProjectReport(project, githubDetails);

        return NextResponse.json({
            success: true,
            report: reportMarkdown
        });

    } catch (error: any) {
        console.error('Error generating AI report:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error while building the report' },
            { status: 500 }
        );
    }
}
