import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import { logActivity } from '@/lib/activity';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        await dbConnect();
        const userWithSettings = await UserModel.findById(user._id).select('settings');

        if (!userWithSettings) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Return settings with defaults if not set
        const settings = userWithSettings.settings || {
            publicProfile: true,
            showEmail: false,
            emailNotifications: true,
            pushNotifications: false,
            twoFactorEnabled: false,
            activityTracking: true,
            darkMode: true,
            theme: 'default'
        };

        return NextResponse.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();

        await dbConnect();

        // Update only the settings fields provided
        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    settings: body,
                    updatedAt: new Date()
                }
            },
            { new: true, runValidators: true }
        ).select('settings');

        if (updatedUser) {
            await logActivity(user._id.toString(), 'SETTINGS_UPDATE', 'User updated settings', body);
        }

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            settings: updatedUser.settings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
