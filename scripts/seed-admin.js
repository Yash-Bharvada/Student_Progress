const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load env vars
const path = require('path');
// Load env vars from the project root .env.local file
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const userSchema = new mongoose.Schema({
    githubId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bio: { type: String },
    skills: [{ type: String }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@admin.com';
        const existingAdmin = await User.findOne({ role: 'admin' });

        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        // Drop the githubId index to ensure it's recreated with sparse: true
        try {
            await mongoose.connection.collection('users').dropIndex('githubId_1');
            console.log('Dropped existing githubId index');
        } catch (e) {
            // Index might not exist, ignore
            console.log('Index githubId_1 not found or already dropped');
        }

        const hashedPassword = await bcrypt.hash('admin', 10);

        const newAdmin = new User({
            email: adminEmail,
            name: 'System Admin',
            password: hashedPassword,
            role: 'admin',
            avatar: 'https://github.com/shadcn.png' // Default avatar
        });

        await newAdmin.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@admin.com');
        console.log('Password: admin');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
