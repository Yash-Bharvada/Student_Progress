import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IMilestone {
    projectId: Types.ObjectId;
    name: string;
    description: string;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    order: { type: Number, required: true },
}, {
    timestamps: true,
});

export const MilestoneModel: Model<IMilestone> = mongoose.models.Milestone || mongoose.model<IMilestone>('Milestone', MilestoneSchema);
