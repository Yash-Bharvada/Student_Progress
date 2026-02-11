import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import { logActivity } from '@/lib/activity';

import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { token, secret } = await request.json();

        if (!token || !secret) {
            return NextResponse.json({ error: 'Token and secret required' }, { status: 400 });
        }

        const authenticator = new TOTP({
            crypto: new NobleCryptoPlugin(),
            base32: new ScureBase32Plugin()
        });

        // Use verify (token, options)
        const isValid = (await authenticator.verify(token, { secret, epochTolerance: 1 })).valid;

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        await dbConnect();

        // Enable 2FA and save secret
        await UserModel.findByIdAndUpdate(user._id, {
            $set: {
                twoFactorSecret: secret,
                'settings.twoFactorEnabled': true
            }
        });

        await logActivity(user._id.toString(), '2FA_ENABLED', 'User enabled Two-Factor Authentication');

        return NextResponse.json({
            success: true,
            message: '2FA Enabled successfully'
        });

    } catch (error) {
        console.error('Error verifying 2FA:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
