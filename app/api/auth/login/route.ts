import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        await dbConnect();

        // Find user and explicitly select password since it might be excluded by default or just to be safe
        // Actually, Mongoose doesn't exclude by default unless selecting '-password'
        const user = await UserModel.findOne({ email });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check if 2FA is enabled
        if (user.settings?.twoFactorEnabled) {
            // Generate temp token for 2FA
            const tempToken = jwt.sign(
                { userId: user._id.toString(), role: user.role, type: '2fa_pending' },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '10m' }
            );

            const response = NextResponse.json({
                success: true,
                twoFactorRequired: true
            });

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

        // Generate token
        const token = generateToken(user._id.toString(), user.role);

        // Log activity
        await logActivity(user._id.toString(), 'LOGIN', 'User logged in via password');

        // Create response with cookie
        const response = NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        // Set secure HTTP-only cookie
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
