import mongoose, { Schema, Model, models } from 'mongoose';

export interface IAIAnalysis {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    repositoryId: mongoose.Types.ObjectId;
    repository: string; // "owner/repo" format
    filePath: string;
    language: string;
    score: number;
    strengths: string[];
    issues: string[];
    suggestions: string[];
    analyzedAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student', // Or 'User' appropriately
            required: true,
        },
        repositoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Repository', // Assuming you have a Repository model or using generic ID
            required: true,
        },
        repository: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 10,
        },
        strengths: [String],
        issues: [String],
        suggestions: [String],
        analyzedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient queries
AIAnalysisSchema.index({ repositoryId: 1, filePath: 1 });
AIAnalysisSchema.index({ studentId: 1, analyzedAt: -1 });

const AIAnalysis: Model<IAIAnalysis> =
    models.AIAnalysis || mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);

export default AIAnalysis;
