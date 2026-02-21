import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { ProjectModel } from '@/lib/models/Project';
import { requireRole } from '@/lib/auth';

export async function GET() {
    try {
        await requireRole(['admin']);
        await dbConnect();

        const mentors = await UserModel.find({ role: 'mentor' }).select('-password').sort({ createdAt: -1 });

        const mentorsWithDetails = await Promise.all(mentors.map(async (mentor) => {
            const studentCount = await UserModel.countDocuments({ role: 'student', mentorId: mentor._id });
            const projectCount = await ProjectModel.countDocuments({ mentorId: mentor._id });

            return {
                ...mentor.toObject(),
                studentCount,
                projectCount
            };
        }));

        return NextResponse.json({ success: true, mentors: mentorsWithDetails });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
    }
}
