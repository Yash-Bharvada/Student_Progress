import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ProjectModel } from '@/lib/models/Project';
import { MilestoneModel } from '@/lib/models/Milestone';
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

        // Assuming auth check is done via listing or we trust the ID if they have access to project page
        // But better to check project access
        const project = await ProjectModel.findById(params.id);
        if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });

        const isMember = project.teamMembers.some((id: any) => id.toString() === user._id.toString());
        const isMentor = project.mentorId.toString() === user._id.toString();

        if (!isMember && !isMentor && user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const milestones = await MilestoneModel.find({ projectId: params.id }).sort({ order: 1 });
        return NextResponse.json({ success: true, milestones });

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

        // Role: Student (Member)
        const isMember = project.teamMembers.some((id: any) => id.toString() === user._id.toString());
        if (!isMember) {
            return NextResponse.json({ success: false, error: 'Only team members can add milestones' }, { status: 403 });
        }

        const body = await request.json();

        const milestone = await MilestoneModel.create({
            projectId: params.id,
            ...body,
            status: 'pending'
        });

        return NextResponse.json({ success: true, milestone });
    } catch (error) {
        console.error('Error creating milestone', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
