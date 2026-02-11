import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ReviewModel } from '@/lib/models/Review';
import { ProjectModel } from '@/lib/models/Project';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'mentor') {
            return NextResponse.json(
                { error: 'Only mentors can submit reviews' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { projectId, rating, comment } = body;

        if (!projectId || !rating || !comment) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify project exists
        const project = await ProjectModel.findById(projectId);
        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        const review = await ReviewModel.create({
            projectId,
            mentorId: user._id,
            rating,
            comment,
        });

        // Populate mentor details for immediate display
        const populatedReview = await ReviewModel.findById(review._id).populate('mentorId', 'name avatar');

        return NextResponse.json({
            success: true,
            review: populatedReview
        });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        const reviews = await ReviewModel.find({ projectId })
            .populate('mentorId', 'name avatar')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
