import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { generateToken } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const installationId = searchParams.get('installation_id');

        // Handle OAuth Callback (User Login)
        if (code) {
            // Exchange code for text
            const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                })
            });

            const tokenData = await tokenResponse.json();

            if (tokenData.error) {
                return NextResponse.redirect(new URL('/?error=github_auth_failed', request.url));
            }

            const accessToken = tokenData.access_token;

            // Fetch User Profile
            const userResponse = await fetch('https://api.github.com/user', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const githubUser = await userResponse.json();

            // Fetch User Emails (in case primary is private)
            const emailsResponse = await fetch('https://api.github.com/user/emails', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const emails = await emailsResponse.json();

            // Find primary verified email
            const primaryEmail = emails.find((e: any) => e.primary && e.verified)?.email || githubUser.email;

            if (!primaryEmail) {
                return NextResponse.redirect(new URL('/?error=no_email_access', request.url));
            }

            await dbConnect();

            // Find student by email (Enrollment Check)
            const user = await UserModel.findOne({ email: primaryEmail });

            if (!user) {
                // Not enrolled
                return NextResponse.redirect(new URL('/?error=not_enrolled', request.url));
            }

            // Update User with GitHub info
            user.githubId = githubUser.id.toString();
            user.username = githubUser.login;
            user.avatar = githubUser.avatar_url || user.avatar;
            user.githubAccessToken = accessToken; // Store OAuth token for user-specific API calls

            // Fix missing name or invalid role from legacy/manual data
            if (!user.name) {
                user.name = githubUser.name || githubUser.login || 'Student';
            }
            if (user.role && typeof user.role === 'string') {
                const normalizedRole = user.role.toLowerCase();
                if (['student', 'mentor', 'admin'].includes(normalizedRole)) {
                    user.role = normalizedRole as any;
                }
            }

            await user.save();

            // Check if 2FA is enabled
            if (user.settings?.twoFactorEnabled) {
                // Generate temp token for 2FA
                const tempToken = jwt.sign(
                    { userId: user._id.toString(), role: user.role, type: '2fa_pending' },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: '10m' }
                );

                const response = NextResponse.redirect(new URL('/auth/2fa', request.url));

                // Set temp token cookie
                response.cookies.set('temp_auth_token', tempToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 10, // 10 minutes
                    path: '/',
                });

                return response;
            }

            // Generate Session Token
            const token = generateToken(user._id.toString(), user.role);

            // Log activity
            await logActivity(user._id.toString(), 'LOGIN', 'User logged in via GitHub');

            // Create response
            const response = NextResponse.redirect(new URL('/dashboard', request.url));

            // Set Auth Cookie
            response.cookies.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });

            return response;
        }

        // Handle Installation Callback (Legacy/Alt)
        if (installationId) {
            console.log('GitHub App Installation Callback:', { installationId });
            const response = NextResponse.redirect(new URL('/dashboard', request.url));
            response.cookies.set('student_installation_id', installationId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });
            return response;
        }

        return NextResponse.redirect(new URL('/?error=invalid_callback', request.url));

    } catch (error) {
        console.error('❌ Error in GitHub callback:', error);
        return NextResponse.redirect(
            new URL('/?error=callback_failed', request.url)
        );
    }
}
