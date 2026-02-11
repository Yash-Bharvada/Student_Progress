import { cookies } from 'next/headers';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
        await dbConnect();
        const user = await UserModel.findById(decoded.userId).select('-password');
        return user;
    } catch (error) {
        return null;
    }
}

export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        // Redirect or throw? throwing allows catching in page/layout
        throw new Error('Not authenticated');
    }

    return user;
}

export async function requireRole(allowedRoles: string[]) {
    const user = await requireAuth();

    if (!allowedRoles.includes(user.role)) {
        throw new Error('Insufficient permissions');
    }

    return user;
}

export async function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 10);
}

export function generateToken(userId: string, role: string) {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}
