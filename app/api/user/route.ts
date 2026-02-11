import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                course: user.course,
                bio: user.bio,
                skills: user.skills
            }
        });
    } catch (error) {
        console.error('Error in user endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { bio, name, githubUsername, course, skills } = body;

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (githubUsername !== undefined) user.username = githubUsername;
        if (course !== undefined) user.course = course;
        if (skills !== undefined) user.skills = skills;

        await user.save();

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                course: user.course,
                bio: user.bio,
                skills: user.skills
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
