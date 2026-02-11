import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { MilestoneModel } from '@/lib/models/Milestone';
import { UserModel } from '@/lib/models/User';

// GET /api/milestones - List milestones
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

        const query: any = {};
        if (projectId) query.projectId = projectId;

        const milestones = await MilestoneModel.find(query)
            .populate('projectId', 'name')
            .sort({ order: 1 });

        return NextResponse.json({ success: true, milestones });
    } catch (error) {
        console.error('Error fetching milestones:', error);
        return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
    }
}

// POST /api/milestones - Create milestone
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
            return NextResponse.json({ error: 'Only mentors can create milestones' }, { status: 403 });
        }

        const body = await request.json();
        const { projectId, name, description, dueDate, order } = body;

        const milestone = await MilestoneModel.create({
            projectId,
            name,
            description,
            dueDate: new Date(dueDate),
            status: 'pending',
            order: order || 1,
        });

        const populatedMilestone = await MilestoneModel.findById(milestone._id)
            .populate('projectId', 'name');

        return NextResponse.json({ success: true, milestone: populatedMilestone });
    } catch (error) {
        console.error('Error creating milestone:', error);
        return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
    }
}
