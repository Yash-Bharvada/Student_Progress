import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            database: 'student_progress',
        });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to connect to database',
                details: String(error)
            },
            { status: 500 }
        );
    }
}
