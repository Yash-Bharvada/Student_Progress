import mongoose, { Schema, Model, models } from 'mongoose';

export interface IRepository {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    name: string;
    fullName: string;
    isPrivate: boolean;
    language: string;
    stars: number;
    forks: number;
    description?: string;
    lastUpdated: Date;
    createdAt: Date;
}

const RepositorySchema = new Schema<IRepository>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        isPrivate: {
            type: Boolean,
            default: false,
        },
        language: {
            type: String,
            default: 'Unknown',
        },
        stars: {
            type: Number,
            default: 0,
        },
        forks: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
        },
        lastUpdated: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Repository: Model<IRepository> =
    models.Repository || mongoose.model<IRepository>('Repository', RepositorySchema);

export default Repository;
