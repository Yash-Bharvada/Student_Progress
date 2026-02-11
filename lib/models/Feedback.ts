import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IFeedback {
    projectId: Types.ObjectId;
    studentId: Types.ObjectId;
    mentorId: Types.ObjectId;
    type: 'comment' | 'review' | 'evaluation';
    content: string;
    rating?: number;
    attachments?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['comment', 'review', 'evaluation'], required: true },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    attachments: [{ type: String }],
}, {
    timestamps: true,
});

export const FeedbackModel: Model<IFeedback> = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
