import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
    githubId?: string;
    email: string;
    username?: string; // GitHub Login
    password?: string;
    name: string;
    avatar?: string;
    course?: string; // e.g., "Full Stack Development"
    enrollmentDate?: Date;
    role: 'student' | 'mentor' | 'admin';
    mentorId?: mongoose.Types.ObjectId;
    bio?: string;
    skills?: string[];
    twoFactorSecret?: string;
    githubAccessToken?: string; // OAuth token for user-specific GitHub API calls
    settings?: {
        publicProfile?: boolean;
        showEmail?: boolean;
        emailNotifications?: boolean;
        pushNotifications?: boolean;
        twoFactorEnabled?: boolean;
        activityTracking?: boolean;
        darkMode?: boolean;
        theme?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    githubId: { type: String, unique: true, sparse: true },
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Hashed password for Admin/Mentor
    name: { type: String, required: true },
    avatar: { type: String },
    course: { type: String },
    enrollmentDate: { type: Date, default: Date.now },
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User' },
    bio: { type: String },
    skills: [{ type: String }],
    twoFactorSecret: { type: String, select: false },
    githubAccessToken: { type: String, select: false }, // Hidden by default for security
    settings: {
        type: {
            publicProfile: { type: Boolean, default: true },
            showEmail: { type: Boolean, default: false },
            emailNotifications: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: false },
            twoFactorEnabled: { type: Boolean, default: false },
            activityTracking: { type: Boolean, default: true },
            darkMode: { type: Boolean, default: true },
            theme: { type: String, default: 'default' }
        },
        default: () => ({
            publicProfile: true,
            showEmail: false,
            emailNotifications: true,
            pushNotifications: false,
            twoFactorEnabled: false,
            activityTracking: true,
            darkMode: true,
            theme: 'default'
        })
    }
}, {
    timestamps: true,
});

export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
