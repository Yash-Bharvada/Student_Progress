import { NextRequest, NextResponse } from 'next/server';
import { getUserRepositories } from '@/lib/github';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Fetch user with access token (it's hidden by default with select: false)
        await dbConnect();
        const userWithToken = await UserModel.findById(user._id).select('+githubAccessToken');

        if (!userWithToken?.githubAccessToken) {
            return NextResponse.json(
                { error: 'GitHub not connected. Please reconnect your GitHub account.' },
                { status: 403 }
            );
        }

        // Get username from query params or use authenticated user's username
        const { searchParams } = new URL(request.url);
        const usernameParam = searchParams.get('username');
        const username = usernameParam || userWithToken.username || userWithToken.name || 'unknown';

        // Fetch user's repositories with their access token
        const repositories = await getUserRepositories(username, userWithToken.githubAccessToken);

        return NextResponse.json({
            success: true,
            repositories,
            username,
        });
    } catch (error: any) {
        console.error('Error fetching repositories:', error);

        // Check if it's a GitHub authentication error
        if (error?.status === 401 || error?.message?.includes('Bad credentials')) {
            return NextResponse.json(
                {
                    error: 'GitHub authentication expired',
                    message: 'Your GitHub access token has expired or is invalid. Please sign out and sign in again to reconnect your GitHub account.',
                    needsReauth: true
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch repositories', details: String(error) },
            { status: 500 }
        );
    }
}
