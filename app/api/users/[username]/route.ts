import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await context.params;
        await dbConnect();

        // Find user by username (case-insensitive)
        const user = await UserModel.findOne({
            username: { $regex: new RegExp(`^${username}$`, 'i') }
        }).select('name username bio avatar role course skills settings email createdAt githubId');

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if public profile is enabled
        // Default to true if settings or publicProfile is undefined
        const isPublic = user.settings?.publicProfile ?? true;

        if (!isPublic) {
            return NextResponse.json(
                { error: 'This profile is private' },
                { status: 403 }
            );
        }

        // Check if email should be shown
        const showEmail = user.settings?.showEmail ?? false;

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                username: user.username,
                bio: user.bio,
                avatar: user.avatar,
                role: user.role,
                course: user.course,
                skills: user.skills,
                joinedAt: user.createdAt,
                // Only return email if allowed
                email: showEmail ? user.email : undefined,
                githubUrl: user.username ? `https://github.com/${user.username}` : undefined
            }
        });

    } catch (error) {
        console.error('Error fetching public user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
