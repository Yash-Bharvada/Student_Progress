import { NextRequest, NextResponse } from 'next/server';
import { getGitHubUser } from '@/lib/github';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username') || 'octocat';

        const user = await getGitHubUser(username);

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('GitHub API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch GitHub user',
                details: String(error)
            },
            { status: 500 }
        );
    }
}
