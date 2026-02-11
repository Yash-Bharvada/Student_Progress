'use server';

import { getCurrentUser } from '@/lib/auth';
import { UserModel } from '@/lib/models/User';
import { ProjectModel } from '@/lib/models/Project';
import dbConnect from '@/lib/mongodb';
import { Octokit } from 'octokit';
import { revalidatePath } from 'next/cache';

interface ProgressMetrics {
    totalCommits: number;
    recentCommits: number; // Last 7 days
    consistencyScore: number; // 0-100
}

async function getAuthenticatedUserWithToken() {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
        throw new Error('Not authenticated');
    }

    await dbConnect();
    const user = await UserModel.findById(sessionUser._id).select('+githubAccessToken');

    if (!user || !user.githubAccessToken) {
        throw new Error('GitHub not connected');
    }

    return user;
}

function extractRepoInfo(githubUrl: string): { owner: string; repo: string } | null {
    // Extract owner and repo from GitHub URL
    // Supports: https://github.com/owner/repo or github.com/owner/repo
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, '') // Remove .git if present
    };
}

async function calculateProgress(octokit: Octokit, owner: string, repo: string, username: string): Promise<number> {
    try {
        // Fetch commits from the repository
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Get all commits by this user
        const { data: allCommits } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            author: username,
            per_page: 100
        });

        // Get recent commits (last 7 days)
        const { data: recentCommits } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            author: username,
            since: sevenDaysAgo.toISOString(),
            per_page: 100
        });

        const totalCommits = allCommits.length;
        const recentCount = recentCommits.length;

        // Calculate consistency score based on commit distribution
        const commitDates = allCommits.map(c => new Date(c.commit.author?.date || ''));
        const daysSinceFirst = commitDates.length > 0
            ? Math.ceil((Date.now() - commitDates[commitDates.length - 1].getTime()) / (1000 * 60 * 60 * 24))
            : 1;
        const avgCommitsPerDay = totalCommits / Math.max(daysSinceFirst, 1);
        const consistencyScore = Math.min(100, avgCommitsPerDay * 20); // Scale to 0-100

        // Calculate weighted progress
        // 40% based on total commits (cap at 50 commits = 100%)
        const commitScore = Math.min(100, (totalCommits / 50) * 100);

        // 30% based on recent activity (cap at 10 commits in 7 days = 100%)
        const recentScore = Math.min(100, (recentCount / 10) * 100);

        // 30% based on consistency
        const progress = Math.round(
            (commitScore * 0.4) +
            (recentScore * 0.3) +
            (consistencyScore * 0.3)
        );

        return Math.min(100, Math.max(0, progress));

    } catch (error) {
        console.error('Error calculating progress:', error);
        return 0;
    }
}

export async function updateProjectGithubUrl(projectId: string, githubUrl: string) {
    try {
        await dbConnect();
        const user = await getCurrentUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Validate GitHub URL
        const repoInfo = extractRepoInfo(githubUrl);
        if (!repoInfo) {
            return { success: false, error: 'Invalid GitHub URL format' };
        }

        // Update project
        const project = await ProjectModel.findByIdAndUpdate(
            projectId,
            { githubUrl },
            { new: true }
        ).lean();

        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        revalidatePath('/projects');
        revalidatePath(`/projects/${projectId}`);

        return { success: true, project: { ...project, _id: project._id.toString() } };

    } catch (error: any) {
        console.error('Error updating GitHub URL:', error);
        return { success: false, error: error.message };
    }
}

export async function syncProjectProgress(projectId: string) {
    try {
        await dbConnect();
        const user = await getAuthenticatedUserWithToken();

        const project = await ProjectModel.findById(projectId);
        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        if (!project.githubUrl) {
            return { success: false, error: 'No GitHub URL linked to this project' };
        }

        const repoInfo = extractRepoInfo(project.githubUrl);
        if (!repoInfo) {
            return { success: false, error: 'Invalid GitHub URL' };
        }

        const octokit = new Octokit({ auth: user.githubAccessToken });

        // Calculate progress
        const progress = await calculateProgress(
            octokit,
            repoInfo.owner,
            repoInfo.repo,
            user.username || user.name
        );

        // Update project with new progress
        project.progress = progress;
        project.lastSynced = new Date();
        await project.save();

        revalidatePath('/projects');
        revalidatePath(`/projects/${projectId}`);

        return {
            success: true,
            progress,
            lastSynced: project.lastSynced.toISOString()
        };

    } catch (error: any) {
        console.error('Error syncing progress:', error);
        return { success: false, error: error.message };
    }
}

export async function addTeamMember(projectId: string, userEmail: string) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        // Find the user to add
        const userToAdd = await UserModel.findOne({ email: userEmail });
        if (!userToAdd) {
            return { success: false, error: 'User not found' };
        }

        // Update project
        const project = await ProjectModel.findByIdAndUpdate(
            projectId,
            { $addToSet: { teamMembers: userToAdd._id } }, // $addToSet prevents duplicates
            { new: true }
        ).populate('teamMembers', 'name email avatar').lean();

        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        // Convert to plain object
        const plainProject: any = {
            ...project,
            _id: project._id.toString(),
            teamMembers: project.teamMembers?.map((m: any) => ({
                _id: m._id.toString(),
                name: m.name,
                email: m.email,
                avatar: m.avatar
            })) || []
        };

        revalidatePath('/projects');
        revalidatePath(`/projects/${projectId}`);

        return { success: true, project: plainProject };

    } catch (error: any) {
        console.error('Error adding team member:', error);
        return { success: false, error: error.message };
    }
}

export async function removeTeamMember(projectId: string, userId: string) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        // Update project
        const project = await ProjectModel.findByIdAndUpdate(
            projectId,
            { $pull: { teamMembers: userId } },
            { new: true }
        ).populate('teamMembers', 'name email avatar').lean();

        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        // Convert to plain object
        const plainProject: any = {
            ...project,
            _id: project._id.toString(),
            teamMembers: project.teamMembers?.map((m: any) => ({
                _id: m._id.toString(),
                name: m.name,
                email: m.email,
                avatar: m.avatar
            })) || []
        };

        revalidatePath('/projects');
        revalidatePath(`/projects/${projectId}`);

        return { success: true, project: plainProject };

    } catch (error: any) {
        console.error('Error removing team member:', error);
        return { success: false, error: error.message };
    }
}

export async function getProjectDetails(projectId: string) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        const project = await ProjectModel.findById(projectId)
            .populate('teamMembers', 'name email avatar')
            .populate('mentorId', 'name email avatar')
            .populate('createdBy', 'name email');

        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        return { success: true, project };

    } catch (error: any) {
        console.error('Error fetching project details:', error);
        return { success: false, error: error.message };
    }
}

export async function searchUsers(query: string) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        // Search users by name or email
        const users = await UserModel.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ],
            role: 'student' // Only search for students
        })
            .select('name email avatar')
            .limit(10)
            .lean();

        // Convert to plain objects
        const plainUsers = users.map((user: any) => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }));

        return { success: true, users: plainUsers };

    } catch (error: any) {
        console.error('Error searching users:', error);
        return { success: false, error: error.message };
    }
}
