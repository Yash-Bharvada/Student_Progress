import mongoose, { Schema, Model, models } from 'mongoose';

export interface ICommitLog {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    repositoryId: mongoose.Types.ObjectId;
    sha: string;
    message: string;
    author: {
        name: string;
        email: string;
        avatar?: string;
    };
    timestamp: Date;
    additions: number;
    deletions: number;
    filesChanged: number;
}

const CommitLogSchema = new Schema<ICommitLog>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        repositoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Repository',
            required: true,
        },
        sha: {
            type: String,
            required: true,
            unique: true,
        },
        message: {
            type: String,
            required: true,
        },
        author: {
            name: String,
            email: String,
            avatar: String,
        },
        timestamp: {
            type: Date,
            required: true,
        },
        additions: {
            type: Number,
            default: 0,
        },
        deletions: {
            type: Number,
            default: 0,
        },
        filesChanged: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

CommitLogSchema.index({ studentId: 1, timestamp: -1 });

const CommitLog: Model<ICommitLog> =
    models.CommitLog || mongoose.model<ICommitLog>('CommitLog', CommitLogSchema);

export default CommitLog;
