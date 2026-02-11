import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IProject {
    name: string;
    description: string;
    objectives: string[];
    techStack: string[];
    startDate: Date;
    endDate: Date;
    status: 'planning' | 'active' | 'completed' | 'archived';
    teamMembers: Types.ObjectId[];
    mentorId: Types.ObjectId;
    githubRepos: string[];
    githubUrl?: string; // Single primary GitHub repository URL
    liveUrl?: string; // Live demo URL
    progress?: number; // 0-100, calculated from GitHub commits
    lastSynced?: Date; // Last time progress was synced from GitHub
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    objectives: [{ type: String }],
    techStack: [{ type: String }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['planning', 'active', 'completed', 'archived'],
        default: 'planning'
    },
    teamMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    githubRepos: [{ type: String }],
    githubUrl: { type: String }, // Primary repository URL
    liveUrl: { type: String }, // Live demo URL
    progress: { type: Number, min: 0, max: 100, default: 0 }, // Progress percentage
    lastSynced: { type: Date }, // Last GitHub sync timestamp
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
});

export const ProjectModel: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
