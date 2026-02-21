import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all users with role 'mentor'
        const mentors = await UserModel.find({ role: 'mentor' })
            .select('_id name avatar email')
            .sort({ name: 1 })
            .lean();

        // Convert _id to string
        const plainMentors = mentors.map((mentor: any) => ({
            ...mentor,
            _id: mentor._id.toString()
        }));

        return NextResponse.json({ success: true, mentors: plainMentors });
    } catch (error) {
        console.error('Error fetching mentors:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
