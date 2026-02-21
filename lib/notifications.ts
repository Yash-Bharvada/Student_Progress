import { NotificationModel } from '@/lib/models/Notification';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO',
    link?: string
) {
    try {
        await dbConnect();

        // Check notification settings
        const user = await UserModel.findById(userId).select('settings email name');

        // Always create in-app notification
        await NotificationModel.create({
            userId,
            title,
            message,
            type,
            link
        });

        // Send Email Notification using Gmail SMTP
        if (user?.email && user?.settings?.emailNotifications) {
            try {
                const mailOptions = {
                    from: `"Student Progress" <${process.env.SMTP_USER}>`,
                    to: user.email,
                    subject: title,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Hi ${user.name || 'Student'},</h2>
                            <p>${message}</p>
                            ${link ? `<p><a href="${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}${link}" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">View Details</a></p>` : ''}
                            <hr style="margin-top: 30px; border: none; border-top: 1px solid #eaeaea;" />
                            <p style="font-size: 12px; color: #666;">This is an automated notification from Student Progress.</p>
                        </div>
                    `
                };

                const info = await transporter.sendMail(mailOptions);
                console.log(`[EMAIL SENT VIA GMAIL] To: ${user.email} | Subject: ${title} | MessageId: ${info.messageId}`);
            } catch (emailError: any) {
                console.error('[EMAIL ERROR] Failed to send email via Gmail SMTP:', emailError);
            }
        }

        // Simulate Push Notification
        if (user?.settings?.pushNotifications) {
            console.log(`[MOCK PUSH] User: ${userId} | Title: ${title} | Body: ${message}`);
            // In a real app, you would use web-push here
        }

    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}
