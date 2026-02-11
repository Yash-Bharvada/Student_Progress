import mongoose, { Schema, Model, models } from 'mongoose';

export interface IStudent {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    githubUsername: string;
    githubId: number;
    skills: {
        language: string;
        proficiency: number;
    }[];
    enrolledAt: Date;
    lastSyncedAt?: Date;
}

const StudentSchema = new Schema<IStudent>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        githubUsername: {
            type: String,
            required: true,
            unique: true,
        },
        githubId: {
            type: Number,
            required: true,
            unique: true,
        },
        skills: [
            {
                language: String,
                proficiency: Number,
            },
        ],
        enrolledAt: {
            type: Date,
            default: Date.now,
        },
        lastSyncedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Student: Model<IStudent> =
    models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
