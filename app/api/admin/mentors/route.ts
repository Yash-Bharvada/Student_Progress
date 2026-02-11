import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { requireRole, hashPassword } from '@/lib/auth';

export async function GET() {
    try {
        await requireRole(['admin']);
        await dbConnect();

        const mentors = await UserModel.find({ role: 'mentor' }).select('-password').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, mentors });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
    }
}

export async function POST(request: Request) {
    try {
        await requireRole(['admin']);
        await dbConnect();

        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        const newMentor = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role: 'mentor',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });

        const { password: _, ...mentorWithoutPassword } = newMentor.toObject();

        return NextResponse.json({ success: true, mentor: mentorWithoutPassword });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
    }
}

export async function DELETE(request: Request) {
    try {
        await requireRole(['admin']);
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Mentor ID is required' }, { status: 400 });
        }

        const deletedMentor = await UserModel.findByIdAndDelete(id);

        if (!deletedMentor) {
            return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Mentor deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
