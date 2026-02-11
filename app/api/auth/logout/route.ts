import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        // Get current user and revoke their GitHub token
        const user = await getCurrentUser();

        if (user) {
            await dbConnect();
            // Clear the stored GitHub access token
            await UserModel.findByIdAndUpdate(user._id, {
                $unset: { githubAccessToken: 1 }
            });
        }

        const response = NextResponse.json({ success: true });

        // Clear all auth cookies
        response.cookies.set('auth_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        response.cookies.set('student_installation_id', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear cookies even if DB update fails
        const response = NextResponse.json({ success: true });
        response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
        response.cookies.set('student_installation_id', '', { maxAge: 0, path: '/' });
        return response;
    }
}
