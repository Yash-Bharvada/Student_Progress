import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ProjectModel } from '@/lib/models/Project';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';

interface Params {
    params: {
        id: string;
    }
}

export async function POST(request: NextRequest, { params }: Params) {
    try {
        await dbConnect();
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const project = await ProjectModel.findById(params.id);
        if (!project) {
            return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
        }

        // Only Project Owner (Student) can add members? Or any member? 
        // Plan says: "Role: Student (Owner)."
        const isOwner = project.createdBy.toString() === user._id.toString();

        if (!isOwner) {
            return NextResponse.json({ success: false, error: 'Only the project owner can add team members' }, { status: 403 });
        }

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        // Find user to add
        const userToAdd = await UserModel.findOne({ email });

        if (!userToAdd) {
            return NextResponse.json({ success: false, error: 'User not found. Ensure they have signed up.' }, { status: 404 });
        }

        // Check if already a member
        if (project.teamMembers.includes(userToAdd._id)) {
            return NextResponse.json({ success: false, error: 'User is already a team member' }, { status: 400 });
        }

        // Add to team
        project.teamMembers.push(userToAdd._id);
        await project.save();

        return NextResponse.json({
            success: true, member: {
                id: userToAdd._id,
                name: userToAdd.name,
                email: userToAdd.email,
                avatar: userToAdd.avatar
            }
        });

    } catch (error) {
        console.error('Error adding team member:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        await dbConnect();
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { memberId } = await request.json(); // Pass memberId in body to remove

        const project = await ProjectModel.findById(params.id);
        if (!project) {
            return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
        }

        const isOwner = project.createdBy.toString() === user._id.toString();

        if (!isOwner) {
            return NextResponse.json({ success: false, error: 'Only the project owner can remove team members' }, { status: 403 });
        }

        // Remove from team
        project.teamMembers = project.teamMembers.filter((id: any) => id.toString() !== memberId);
        await project.save();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error removing team member:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
