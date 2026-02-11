import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import Repository from '@/models/Repository';
import CommitLog from '@/models/CommitLog';
import {
    getGitHubUser,
    getUserRepositories,
    getCommitHistory,
    getCommitDetails,
} from '@/lib/github';

export async function POST(request: NextRequest) {
    try {
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json(
                { error: 'GitHub username is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Fetch GitHub user data
        const githubUser = await getGitHubUser(username);

        // Find or create student
        let student = await Student.findOne({ githubUsername: username });

        if (!student) {
            student = await Student.create({
                name: githubUser.name,
                email: githubUser.email || `${username}@github.com`,
                githubUsername: githubUser.login,
                githubId: githubUser.id,
                skills: [],
            });
        }

        // Fetch repositories
        const repos = await getUserRepositories(username);

        let repoCount = 0;
        let commitCount = 0;
        const languageStats: Record<string, number> = {};

        for (const repoData of repos) {
            // Create or update repository
            const repository = await Repository.findOneAndUpdate(
                { studentId: student._id, fullName: repoData.fullName },
                {
                    studentId: student._id,
                    ...repoData,
                },
                { upsert: true, new: true }
            );

            repoCount++;

            // Track language stats
            if (repoData.language && repoData.language !== 'Unknown') {
                languageStats[repoData.language] =
                    (languageStats[repoData.language] || 0) + 1;
            }

            // Fetch commits for this repository
            try {
                const [owner, repo] = repoData.fullName.split('/');
                const commits = await getCommitHistory(owner, repo, username);

                for (const commitData of commits) {
                    // Check if commit already exists
                    const existingCommit = await CommitLog.findOne({ sha: commitData.sha });

                    if (!existingCommit) {
                        // Fetch detailed commit stats
                        const details = await getCommitDetails(owner, repo, commitData.sha);

                        await CommitLog.create({
                            studentId: student._id,
                            repositoryId: repository._id,
                            sha: commitData.sha,
                            message: commitData.message,
                            author: commitData.author,
                            timestamp: commitData.timestamp,
                            additions: details.additions,
                            deletions: details.deletions,
                            filesChanged: details.filesChanged,
                        });

                        commitCount++;
                    }
                }
            } catch (error) {
                console.error(`Error fetching commits for ${repoData.fullName}:`, error);
            }
        }

        // Update student skills based on language stats
        const skills = Object.entries(languageStats).map(([language, count]) => ({
            language,
            proficiency: Math.min(100, (count / repos.length) * 100),
        }));

        student.skills = skills;
        student.lastSyncedAt = new Date();
        await student.save();

        return NextResponse.json({
            success: true,
            message: 'GitHub data synced successfully',
            stats: {
                repositories: repoCount,
                commits: commitCount,
                languages: Object.keys(languageStats).length,
            },
        });
    } catch (error) {
        console.error('Error syncing GitHub data:', error);
        return NextResponse.json(
            { error: 'Failed to sync GitHub data', details: String(error) },
            { status: 500 }
        );
    }
}
