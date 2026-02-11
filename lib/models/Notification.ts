import mongoose, { Schema, Model } from 'mongoose';

export interface INotification {
    userId: mongoose.Types.ObjectId;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    link?: string;
}

const NotificationSchema = new Schema<INotification>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'], default: 'INFO' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    link: { type: String }
});

// Index for fetching user notifications efficiently
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
