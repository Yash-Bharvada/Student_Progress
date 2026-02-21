import mongoose, { Schema, Model } from 'mongoose';

export interface IAnnouncement {
    title: string;
    content: string;
    authorId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

export const AnnouncementModel: Model<IAnnouncement> = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
