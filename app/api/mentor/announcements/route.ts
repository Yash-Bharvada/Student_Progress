import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { AnnouncementModel } from '@/lib/models/Announcement';
import { NotificationModel } from '@/lib/models/Notification';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        if (user.role !== 'mentor' && user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { title, content } = await request.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        await dbConnect();

        // 1. Create Announcement
        const announcement = await AnnouncementModel.create({
            title,
            content,
            authorId: user._id
        });

        // 2. Fetch all students
        const students = await UserModel.find({ role: 'student' }).select('_id');

        // 3. Create Notifications
        if (students.length > 0) {
            const notifications = students.map(student => ({
                userId: student._id,
                type: 'INFO',
                title: `New Announcement: ${title}`,
                message: content, // Store full content for the dialog
                link: '#'
            }));

            await NotificationModel.insertMany(notifications);
        }

        return NextResponse.json({ success: true, announcement });

    } catch (error) {
        console.error('Error creating announcement:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // If mentor, return their announcements? Or all?
        // Let's return all for now, sorted by date.
        const announcements = await AnnouncementModel.find()
            .sort({ createdAt: -1 })
            .populate('authorId', 'name email')
            .limit(50);

        return NextResponse.json({ success: true, announcements });

    } catch (error) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
