import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import { generateToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();
        const tempToken = request.cookies.get('temp_auth_token')?.value;

        if (!tempToken) {
            return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 401 });
        }

        if (!token) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        // Verify temp token
        let decoded;
        try {
            decoded = jwt.verify(tempToken, JWT_SECRET) as { userId: string, role: string, type: string };
            if (decoded.type !== '2fa_pending') {
                return NextResponse.json({ error: 'Invalid session state' }, { status: 403 });
            }
        } catch (e) {
            return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
        }

        await dbConnect();
        const user = await UserModel.findById(decoded.userId).select('+twoFactorSecret');

        if (!user || !user.twoFactorSecret) {
            return NextResponse.json({ error: 'User not found or 2FA not set' }, { status: 404 });
        }

        const authenticator = new TOTP({
            crypto: new NobleCryptoPlugin(),
            base32: new ScureBase32Plugin()
        });

        // Verify OTP
        const isValid = (await authenticator.verify(token, { secret: user.twoFactorSecret, epochTolerance: 1 })).valid;

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Generate full token
        const fullToken = generateToken(user._id.toString(), user.role);

        const response = NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        // Set full auth token
        response.cookies.set('auth_token', fullToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Clear temp token
        response.cookies.delete('temp_auth_token');

        return response;

    } catch (error) {
        console.error('2FA validation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
