import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ProjectModel } from '@/lib/models/Project';
import { createNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // 1. Get the mentor's details from the frontend request
        const { mentorId, mentorName } = await request.json();

        if (!mentorId) {
            return NextResponse.json({ success: false, error: 'Mentor ID is required' }, { status: 400 });
        }

        const now = new Date();
        const twoDaysFromNow = new Date(now);
        twoDaysFromNow.setDate(now.getDate() + 2);

        // 2. FetchONLY this mentor's students' projects from the database
        // We look for projects that are active/planning, within 48 hours, not yet warned,
        // and specifically assigned to this mentorId.
        const projects = await ProjectModel.find({
            mentorId: mentorId, // Filter by the requested mentor
            status: { $in: ['active', 'planning'] },
            endDate: { $gt: now, $lte: twoDaysFromNow },
            deadlineWarningSent: { $ne: true }
        }).populate('teamMembers', 'email name');

        let notificationsSent = 0;

        // 3. Check deadlines and send emails
        for (const project of projects) {
            for (const member of project.teamMembers) {
                const timeDiff = project.endDate.getTime() - now.getTime();
                const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                const title = `Action Required: '${project.name}' Deadline Approaching!`;
                // Incorporating the Mentor's name into the email body as requested
                const message = `Your project '${project.name}' is due in ${daysLeft} day(s).\n\nYour mentor, ${mentorName || 'your assigned mentor'}, is expecting your submission soon. Please ensure you complete your tasks on time.`;

                // Fire notification. We pass member._id as string
                // The `createNotification` handles Gmail SMTP internally
                await createNotification(
                    member._id.toString(),
                    title,
                    message,
                    'WARNING',
                    `/projects/${project._id}`
                );
                notificationsSent++;
            }

            // Mark this project so we don't spam them tomorrow if they haven't finished it
            project.deadlineWarningSent = true;
            await project.save();
        }

        return NextResponse.json({
            success: true,
            message: `Successfully sent ${notificationsSent} reminder(s).`,
            projectsProcessed: projects.length
        });

    } catch (error) {
        console.error('Error in send-reminders API:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
