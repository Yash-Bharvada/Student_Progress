import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Message from '@/lib/models/Message';
import dbConnect from '@/lib/mongodb';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const user = await requireAuth();
        await dbConnect();

        const { userId: otherUserId } = await params;

        if (!otherUserId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Mark messages as read where sender is otherUserId and receiver is current user
        await Message.updateMany(
            { sender: otherUserId, receiver: user._id, isRead: false },
            { $set: { isRead: true } }
        );

        // Fetch messages between current user and otherUserId
        const messages = await Message.find({
            $or: [
                { sender: user._id, receiver: otherUserId },
                { sender: otherUserId, receiver: user._id },
            ],
        })
            .sort({ createdAt: 1 }) // Oldest first for chat history
            .populate('sender', 'name avatar role') // Populate sender details if needed
            .exec();

        return NextResponse.json(messages);
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
