import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';

// GET /api/admin/users - List all users (admin only)
export async function GET(request: NextRequest) {
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

        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const users = await UserModel.find().sort({ createdAt: -1 });

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
