import { NotificationModel } from '@/lib/models/Notification';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO',
    link?: string
) {
    try {
        await dbConnect();

        // Check notification settings
        const user = await UserModel.findById(userId).select('settings email');

        // Always create in-app notification
        await NotificationModel.create({
            userId,
            title,
            message,
            type,
            link
        });

        // Simulate Email Notification
        if (user?.settings?.emailNotifications) {
            console.log(`[MOCK EMAIL] To: ${user.email} | Subject: ${title} | Body: ${message}`);
            // In a real app, you would call Resend or SendGrid here
        }

        // Simulate Push Notification
        if (user?.settings?.pushNotifications) {
            console.log(`[MOCK PUSH] User: ${userId} | Title: ${title} | Body: ${message}`);
            // In a real app, you would use web-push here
        }

    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}
