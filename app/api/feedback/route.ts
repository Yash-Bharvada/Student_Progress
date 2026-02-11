import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { FeedbackModel } from '@/lib/models/Feedback';
import { UserModel } from '@/lib/models/User';

// GET /api/feedback - Get feedback
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const installationId = cookieStore.get('student_installation_id');

        if (!installationId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const studentId = searchParams.get('studentId');

        let query: any = {};

        if (projectId) query.projectId = projectId;
        if (studentId) query.studentId = studentId;

        const feedback = await FeedbackModel.find(query)
            .populate('studentId', 'name avatar')
            .populate('mentorId', 'name avatar')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }
}

// POST /api/feedback - Submit feedback
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const installationId = cookieStore.get('student_installation_id');

        if (!installationId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        const username = 'Yash-Bharvada';
        const user = await UserModel.findOne({ name: username });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.role === 'student') {
            return NextResponse.json({ error: 'Only mentors can submit feedback' }, { status: 403 });
        }

        const body = await request.json();
        const { projectId, studentId, type, content, rating } = body;

        const feedback = await FeedbackModel.create({
            projectId,
            studentId,
            mentorId: user._id,
            type,
            content,
            rating,
        });

        const populatedFeedback = await FeedbackModel.findById(feedback._id)
            .populate('studentId', 'name avatar')
            .populate('mentorId', 'name avatar')
            .populate('projectId', 'name');

        return NextResponse.json({ success: true, feedback: populatedFeedback });
    } catch (error) {
        console.error('Error creating feedback:', error);
        return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
    }
}
