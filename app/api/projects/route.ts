import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import { ProjectModel } from '@/lib/models/Project';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        let query = {};
        if (user.role === 'mentor') {
            query = { mentorId: user._id };
        } else if (user.role === 'student') {
            // Student sees projects they created or are a team member of
            query = {
                $or: [
                    { createdBy: user._id },
                    { teamMembers: user._id }
                ]
            };
        } else if (user.role === 'admin') {
            // Admin sees all? Or maybe none for now, but let's allow all
            query = {};
        }

        const projects = await ProjectModel.find(query)
            .populate('teamMembers', 'name avatar email')
            .populate('mentorId', 'name')
            .sort({ updatedAt: -1 })
            .lean(); // Get plain objects instead of Mongoose documents

        // Convert _id to string for all objects
        const plainProjects = projects.map((project: any) => ({
            ...project,
            _id: project._id.toString(),
            teamMembers: project.teamMembers?.map((member: any) => ({
                _id: member._id.toString(),
                name: member.name,
                avatar: member.avatar,
                email: member.email
            })) || [],
            mentorId: project.mentorId?._id ? project.mentorId._id.toString() : project.mentorId?.toString() || null,
            createdBy: project.createdBy.toString()
        }));

        return NextResponse.json({ success: true, projects: plainProjects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Basic validation
        if (!body.name || !body.description || !body.startDate || !body.endDate) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        let mentorId = null;

        if (user.role === 'student') {
            if (!user.mentorId) {
                return NextResponse.json({ success: false, error: 'You must be enrolled by a mentor to create a project.' }, { status: 403 });
            }
            mentorId = user.mentorId;
        } else if (user.role === 'mentor') {
            // If mentor creates, they must assign to a student? Or just create for themselves? 
            // The prompt says "Student (creates for self) or Mentor". 
            // If mentor creates, they are the mentor.
            mentorId = user._id;
        }

        const project = await ProjectModel.create({
            ...body,
            mentorId: mentorId,
            createdBy: user._id,
            teamMembers: [user._id], // Creator is automatically a member
            status: 'planning',
            liveUrl: body.liveUrl // Explicitly add liveUrl
        });

        // Convert to plain object with all IDs as strings
        const projectObj = project.toObject();
        const plainProject = {
            ...projectObj,
            _id: projectObj._id.toString(),
            teamMembers: projectObj.teamMembers.map((id: any) => id.toString()),
            mentorId: projectObj.mentorId?.toString() || null,
            createdBy: projectObj.createdBy.toString(),
            createdAt: projectObj.createdAt.toISOString(),
            updatedAt: projectObj.updatedAt.toISOString(),
            startDate: projectObj.startDate.toISOString(),
            endDate: projectObj.endDate.toISOString(),
            liveUrl: projectObj.liveUrl
        };

        return NextResponse.json({ success: true, project: plainProject });

    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
