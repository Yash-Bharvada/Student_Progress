import mongoose, { Schema, Model, Types } from 'mongoose';

export interface ITask {
    projectId: Types.ObjectId;
    milestoneId?: Types.ObjectId;
    title: string;
    description: string;
    assignedTo: Types.ObjectId;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in-progress' | 'review' | 'done';
    dueDate: Date;
    githubIssueUrl?: string;
    tags?: string[];
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    milestoneId: { type: Schema.Types.ObjectId, ref: 'Milestone' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
    dueDate: { type: Date, required: true },
    githubIssueUrl: { type: String },
    tags: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
});

export const TaskModel: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
