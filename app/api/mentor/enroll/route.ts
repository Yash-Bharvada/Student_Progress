import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { requireRole } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const mentor = await requireRole(['mentor']);
        await dbConnect();

        const { name, email } = await request.json();

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        // Check if user exists
        let user = await UserModel.findOne({ email });

        if (user) {
            // If user exists and is a student without a mentor, we claim them? 
            // Or if they are already enrolled?
            if (user.role !== 'student') {
                return NextResponse.json({ error: 'User exists and is not a student' }, { status: 409 });
            }
            if (user.mentorId) {
                return NextResponse.json({ error: 'Student is already enrolled with a mentor' }, { status: 409 });
            }

            // Assign to this mentor
            user.mentorId = mentor._id;
            await user.save();
        } else {
            // Create new pending student
            user = await UserModel.create({
                name,
                email,
                role: 'student',
                mentorId: mentor._id,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            });
        }

        return NextResponse.json({ success: true, student: user });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
    }
}
