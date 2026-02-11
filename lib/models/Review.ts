import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IReview {
    projectId: Types.ObjectId;
    mentorId: Types.ObjectId;
    rating: number; // 1-5
    comment: string;
    createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, {
    timestamps: true
});

export const ReviewModel: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
