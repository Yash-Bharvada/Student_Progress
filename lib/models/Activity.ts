import mongoose, { Schema, Model } from 'mongoose';

export interface IActivity {
    userId: mongoose.Types.ObjectId;
    action: string;
    description: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'LOGIN', 'PROJECT_CREATE', 'SETTINGS_UPDATE'
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, expires: '30d' } // Auto-delete after 30 days
});

// Index for faster queries by user and date
ActivitySchema.index({ userId: 1, createdAt: -1 });

export const ActivityModel: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
