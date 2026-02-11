import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { requireRole } from '@/lib/auth';

export async function GET() {
    try {
        const mentor = await requireRole(['mentor']);
        await dbConnect();

        const students = await UserModel.find({ mentorId: mentor._id }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, students });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
    }
}
