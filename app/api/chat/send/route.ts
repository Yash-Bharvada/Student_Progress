import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Message from '@/lib/models/Message';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';

export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth();
        await dbConnect();

        const body = await req.json();
        const { receiverId, content } = body;

        if (!receiverId || !content) {
            return NextResponse.json(
                { error: 'Receiver ID and content are required' },
                { status: 400 }
            );
        }

        // Validate receiver exists
        const receiver = await UserModel.findById(receiverId);
        if (!receiver) {
            return NextResponse.json(
                { error: 'Receiver not found' },
                { status: 404 }
            );
        }

        // Validate relationship (improving security)
        // If sender is student, receiver must be their mentor
        // If sender is mentor, receiver must be one of their students (or verify if needed)

        if (user.role === 'student') {
            if (user.mentorId?.toString() !== receiverId) {
                return NextResponse.json(
                    { error: 'You can only message your assigned mentor' },
                    { status: 403 }
                );
            }
        }

        // If sender is mentor, we might want to check if the student is assigned to them
        // For now, basic role check is good, can be enhanced.
        if (user.role === 'mentor') {
            // Optional: Check if receiver.mentorId === user._id
            if (receiver.mentorId?.toString() !== user._id.toString()) {
                return NextResponse.json(
                    { error: 'You can only message your assigned students' },
                    { status: 403 }
                );
            }
        }

        const message = await Message.create({
            sender: user._id,
            receiver: receiverId,
            content,
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error: any) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
