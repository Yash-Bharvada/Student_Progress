import { ActivityModel } from '@/lib/models/Activity';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';

export async function logActivity(
    userId: string,
    action: string,
    description: string,
    metadata?: Record<string, any>
) {
    try {
        await dbConnect();

        // Check if user has activity tracking enabled
        const user = await UserModel.findById(userId).select('settings');
        if (!user || user.settings?.activityTracking === false) {
            return;
        }

        await ActivityModel.create({
            userId,
            action,
            description,
            metadata
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw error to avoid disrupting the main flow
    }
}
