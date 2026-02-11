import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { NotificationModel } from '@/lib/models/Notification';
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        const notifications = await NotificationModel.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        // Count unread notifications
        const unreadCount = await NotificationModel.countDocuments({
            userId: user._id,
            read: false
        });

        return NextResponse.json({
            success: true,
            notifications,
            unreadCount
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Mark all as read
        await NotificationModel.updateMany(
            { userId: user._id, read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
