"use server";

import dbConnect from "@/lib/mongodb";
import { UserModel, IUser } from "@/lib/models/User";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";

// Type for the student data used in the UI
export interface StudentData {
    id: string;
    name: string;
    email: string;
    githubHandle: string;
    avatar: string;
    course: string;
    enrollmentDate: string;
    status: 'active' | 'inactive' | 'graduated';
    progress: number;
    lastActive: string;
    projectName?: string;
    projectId?: string;
    projectProgress?: number;
}

export async function getStudents(): Promise<StudentData[]> {
    await dbConnect();

    try {
        const currentUser = await getCurrentUser();
        let query: any = { role: 'student' };

        if (currentUser?.role === 'mentor') {
            const ProjectModel = await import('@/lib/models/Project').then(m => m.ProjectModel);
            const mentorProjects = await ProjectModel.find({ mentorId: currentUser._id }).select('teamMembers');

            // Extract all student IDs from the mentor's projects
            const studentIds = mentorProjects.flatMap(p => p.teamMembers);

            // Fetch students that are either in the mentor's projects OR explicitly assigned to the mentor in their profile
            query = {
                $and: [
                    { role: 'student' },
                    { $or: [{ _id: { $in: studentIds } }, { mentorId: currentUser._id }] }
                ]
            };
        }

        const students = await UserModel.find(query).sort({ createdAt: -1 });

        // Fetch projects for these students
        // We need to find projects where teamMembers include the student's ID
        const studentsWithProjects = await Promise.all(students.map(async (student) => {
            const project = await import('@/lib/models/Project').then(m => m.ProjectModel.findOne({
                teamMembers: { $in: [student._id] }
            }).sort({ updatedAt: -1 }).select('name _id progress status'));

            if (!project) {
                console.log(`No project found for student ${student.name} (${student._id})`);
            } else {
                console.log(`Found project ${project.name} (${project.status}) for ${student.name}`);
            }

            return {
                id: student._id.toString(),
                name: student.name,
                email: student.email,
                githubHandle: student.username || '',
                avatar: student.avatar || '',
                course: student.course || 'Full Stack Development',
                enrollmentDate: student.enrollmentDate ? student.enrollmentDate.toISOString() : student.createdAt.toISOString(),
                status: 'active' as const,
                progress: project ? (project.progress || 0) : 0,
                lastActive: student.updatedAt.toISOString(),
                projectName: project?.name,
                projectId: project?._id.toString(),
                projectProgress: project?.progress
            };
        }));

        return studentsWithProjects;
    } catch (error) {
        console.error("Failed to fetch students:", error);
        return [];
    }
}

export async function addStudent(formData: FormData) {
    await dbConnect();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const githubHandle = formData.get("githubHandle") as string;

    if (!name || !email) {
        return { success: false, error: "Name and Email are required" };
    }

    try {
        const newStudent = await UserModel.create({
            name,
            email,
            username: githubHandle,
            role: 'student',
            avatar: `https://github.com/${githubHandle || 'github'}.png`, // Basic avatar fallback
            course: 'Full Stack Development',
            enrollmentDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        revalidatePath("/students");
        return { success: true, id: newStudent._id.toString() };
    } catch (error: any) {
        console.error("Failed to add student:", error);
        return { success: false, error: error.message };
    }
}

export async function updateStudent(id: string, formData: FormData) {
    await dbConnect();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const githubHandle = formData.get("githubHandle") as string;
    const course = formData.get("course") as string;

    try {
        await UserModel.findByIdAndUpdate(id, {
            name,
            email,
            username: githubHandle,
            course
        });

        revalidatePath("/students");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update student:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteStudent(id: string) {
    await dbConnect();

    try {
        await UserModel.findByIdAndDelete(id);
        revalidatePath("/students");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete student:", error);
        return { success: false, error: error.message };
    }
}
