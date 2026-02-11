import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import QRCode from 'qrcode';

import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const authenticator = new TOTP({
            crypto: new NobleCryptoPlugin(),
            base32: new ScureBase32Plugin()
        });

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.toURI({ issuer: 'Student Progress App', label: user.email, secret });
        const imageUrl = await QRCode.toDataURL(otpauth);

        // Store secret temporarily in session or return it to be sent back with verification?
        // Better to return it signed or just return it and expect client to send it back for verification
        // But for security, we save it to DB but don't enable it yet?
        // Or we can just return it and save it only when verified.

        return NextResponse.json({
            success: true,
            secret,
            qrCode: imageUrl
        });

    } catch (error) {
        console.error('Error ensuring 2FA setup:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
