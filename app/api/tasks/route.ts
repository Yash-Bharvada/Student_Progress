import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { TaskModel } from '@/lib/models/Task';
import { UserModel } from '@/lib/models/User';

// GET /api/tasks - List tasks
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
        const userId = searchParams.get('userId');

        const username = 'Yash-Bharvada';
        const user = await UserModel.findOne({ name: username });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let query: any = {};

        if (projectId) {
            query.projectId = projectId;
        }

        if (userId) {
            query.assignedTo = userId;
        } else if (user.role === 'student') {
            // Students see only their tasks
            query.assignedTo = user._id;
        }

        const tasks = await TaskModel.find(query)
            .populate('assignedTo', 'name avatar')
            .populate('createdBy', 'name')
            .populate('projectId', 'name')
            .sort({ dueDate: 1 });

        return NextResponse.json({ success: true, tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

// POST /api/tasks - Create task
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
            return NextResponse.json({ error: 'Only mentors can create tasks' }, { status: 403 });
        }

        const body = await request.json();
        const { projectId, milestoneId, title, description, assignedTo, priority, dueDate, tags } = body;

        const task = await TaskModel.create({
            projectId,
            milestoneId,
            title,
            description,
            assignedTo,
            priority: priority || 'medium',
            status: 'todo',
            dueDate: new Date(dueDate),
            tags: tags || [],
            createdBy: user._id,
        });

        const populatedTask = await TaskModel.findById(task._id)
            .populate('assignedTo', 'name avatar')
            .populate('createdBy', 'name')
            .populate('projectId', 'name');

        return NextResponse.json({ success: true, task: populatedTask });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}

// PATCH /api/tasks/[id] - Update task status
export async function PATCH(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const installationId = cookieStore.get('student_installation_id');

        if (!installationId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();
        const { taskId, status } = body;

        const task = await TaskModel.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        ).populate('assignedTo', 'name avatar');

        return NextResponse.json({ success: true, task });
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}
