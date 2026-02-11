import { NextRequest, NextResponse } from 'next/server';
import { getAppInstallations } from '@/lib/github';

export async function GET(request: NextRequest) {
    try {
        const installations = await getAppInstallations();

        return NextResponse.json({
            success: true,
            installations,
            message: 'Copy one of the installation IDs below and add it to your .env.local file as GITHUB_INSTALLATION_ID',
        });
    } catch (error) {
        console.error('Error fetching installations:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch GitHub App installations',
                details: String(error),
                hint: 'Make sure your GitHub App is installed on your account or organization. Visit: https://github.com/apps/your-app-name/installations/new'
            },
            { status: 500 }
        );
    }
}
