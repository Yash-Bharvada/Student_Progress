import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { ProjectModel } from '@/lib/models/Project';
import { requireRole } from '@/lib/auth';

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole(['admin']);
        await dbConnect();

        const params = await context.params;
        const mentorId = params.id;

        const mentor = await UserModel.findById(mentorId).select('-password');

        if (!mentor || mentor.role !== 'mentor') {
            return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
        }

        const students = await UserModel.find({ role: 'student', mentorId }).select('name email avatar course githubId');

        const projects = await ProjectModel.find({ mentorId }).populate({
            path: 'teamMembers',
            select: 'name email avatar'
        });

        return NextResponse.json({
            success: true,
            mentor,
            students,
            projects
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
