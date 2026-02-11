import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ProjectModel } from '@/lib/models/Project';
import { FeedbackModel } from '@/lib/models/Feedback';
import dbConnect from '@/lib/mongodb';

interface Params {
    params: {
        id: string;
    }
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        await dbConnect();
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const feedback = await FeedbackModel.find({ projectId: params.id })
            .populate('mentorId', 'name avatar')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: Params) {
    try {
        await dbConnect();
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const project = await ProjectModel.findById(params.id);
        if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });

        // Role: Mentor Only (and must be THE mentor?)
        // Plan says: "Mentor ONLY". Ideally strict check:
        const isProjectMentor = project.mentorId.toString() === user._id.toString();

        if (user.role !== 'mentor' || !isProjectMentor) {
            return NextResponse.json({ success: false, error: 'Only the assigned mentor can provide feedback' }, { status: 403 });
        }

        const body = await request.json();

        const feedback = await FeedbackModel.create({
            projectId: params.id,
            mentorId: user._id,
            studentId: project.createdBy, // Default to creator, or maybe handle generic project feedback
            type: body.type || 'comment',
            content: body.content,
            rating: body.rating
        });

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error('Error creating feedback', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
