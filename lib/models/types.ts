import { ObjectId } from 'mongodb';

export interface User {
    _id?: ObjectId;
    githubId: string;
    email: string;
    name: string;
    avatar: string;
    role: 'student' | 'mentor' | 'admin';
    bio?: string;
    skills?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Project {
    _id?: ObjectId;
    name: string;
    description: string;
    objectives: string[];
    startDate: Date;
    endDate: Date;
    status: 'planning' | 'active' | 'completed' | 'archived';
    teamMembers: ObjectId[]; // User IDs
    mentorId: ObjectId;
    githubRepos: string[]; // Repository names
    createdBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface Milestone {
    _id?: ObjectId;
    projectId: ObjectId;
    name: string;
    description: string;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Task {
    _id?: ObjectId;
    projectId: ObjectId;
    milestoneId?: ObjectId;
    title: string;
    description: string;
    assignedTo: ObjectId;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in-progress' | 'review' | 'done';
    dueDate: Date;
    githubIssueUrl?: string;
    tags?: string[];
    createdBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface Feedback {
    _id?: ObjectId;
    projectId: ObjectId;
    studentId: ObjectId;
    mentorId: ObjectId;
    type: 'comment' | 'review' | 'evaluation';
    content: string;
    rating?: number; // 1-5
    attachments?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PerformanceScore {
    _id?: ObjectId;
    userId: ObjectId;
    projectId: ObjectId;
    totalScore: number;
    breakdown: {
        taskCompletion: number; // 40%
        deadlineAdherence: number; // 30%
        codeQuality: number; // 20%
        collaboration: number; // 10%
    };
    calculatedAt: Date;
}
