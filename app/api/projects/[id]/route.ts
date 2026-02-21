import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ProjectModel } from '@/lib/models/Project';
import dbConnect from '@/lib/mongodb';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // params is now a Promise in Next.js 15+
) {
    try {
        await dbConnect();
        const user = await getCurrentUser();
        const { id } = await context.params;

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Find existing project to check permissions
        const project = await ProjectModel.findById(id);

        if (!project) {
            return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
        }

        // Check if user is creator, team member, or mentor
        const isCreator = project.createdBy.toString() === user._id.toString();
        const isTeamMember = project.teamMembers.some((memberId: any) => memberId.toString() === user._id.toString());
        const isMentor = project.mentorId?.toString() === user._id.toString();

        if (!isCreator && !isTeamMember && !isMentor && user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'You do not have permission to update this project' }, { status: 403 });
        }

        // Allowed updates
        const allowedUpdates = ['name', 'description', 'status', 'techStack', 'githubUrl', 'liveUrl', 'startDate', 'endDate'];
        const updates: any = {};

        Object.keys(body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = body[key];
            }
        });

        // Update
        const updatedProject = await ProjectModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        ).populate('teamMembers', 'name avatar email'); // Populate for immediate UI update

        if (!updatedProject) {
            return NextResponse.json({ success: false, error: 'Project not found after update' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            project: {
                ...updatedProject.toObject(),
                _id: updatedProject._id.toString(),
                teamMembers: updatedProject.teamMembers.map((m: any) => ({
                    _id: m._id.toString(),
                    name: m.name,
                    avatar: m.avatar,
                    email: m.email
                })),
                mentorId: updatedProject.mentorId?.toString(),
                createdBy: updatedProject.createdBy.toString(),
                createdAt: updatedProject.createdAt.toISOString(),
                updatedAt: updatedProject.updatedAt.toISOString(),
                startDate: updatedProject.startDate.toISOString(),
                endDate: updatedProject.endDate.toISOString(),
            }
        });

    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
