import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserRepositories, getCommitHistory } from '@/lib/github';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Fetch user with access token (it's hidden by default with select: false)
        await dbConnect();
        const userWithToken = await UserModel.findById(user._id).select('+githubAccessToken');

        if (!userWithToken?.githubAccessToken) {
            return NextResponse.json(
                { error: 'GitHub not connected. Please reconnect your GitHub account.' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        // Use authenticated user's GitHub username
        const usernameParam = searchParams.get('username');
        const username = usernameParam || userWithToken.username || userWithToken.name || 'unknown';

        // Fetch user's repositories with their access token
        const repositories = await getUserRepositories(username, userWithToken.githubAccessToken);

        // Get recent commits from top repositories (limit to 5 repos for performance)
        const topRepos = repositories.slice(0, 5);
        let totalCommits = 0;
        let totalPRs = 0;
        const recentActivities: any[] = [];

        for (const repo of topRepos) {
            try {
                const [owner, repoName] = repo.fullName.split('/');
                // Use user's access token for commit history
                const commits = await getCommitHistory(owner, repoName, username, userWithToken.githubAccessToken);

                totalCommits += commits.length;

                // Add recent commits to activities
                commits.slice(0, 3).forEach(commit => {
                    recentActivities.push({
                        id: commit.sha,
                        type: 'commit',
                        message: commit.message,
                        author: commit.author,
                        timestamp: commit.timestamp,
                        repository: repoName,
                    });
                });
            } catch (error) {
                console.error(`Error fetching commits for ${repo.name}:`, error);
            }
        }

        // Sort activities by timestamp
        recentActivities.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Calculate language proficiency from repositories
        const languageStats: Record<string, number> = {};
        repositories.forEach(repo => {
            if (repo.language && repo.language !== 'Unknown') {
                languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
            }
        });

        const totalRepos = Object.values(languageStats).reduce((a, b) => a + b, 0);
        const skills = Object.entries(languageStats)
            .map(([language, count]) => ({
                language,
                proficiency: Math.round((count / totalRepos) * 100),
                color: getLanguageColor(language),
            }))
            .sort((a, b) => b.proficiency - a.proficiency)
            .slice(0, 5);

        return NextResponse.json({
            success: true,
            stats: {
                totalCommits,
                totalPRs,
                totalRepos: repositories.length,
                activeStudents: 1, // For now, just the authenticated user
            },
            recentActivities: recentActivities.slice(0, 10),
            skills,
            repositories: repositories.slice(0, 10),
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data', details: String(error) },
            { status: 500 }
        );
    }
}

function getLanguageColor(language: string): string {
    const colors: Record<string, string> = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Python': '#3776ab',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'C': '#555555',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Swift': '#ffac45',
        'Kotlin': '#A97BFF',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Shell': '#89e051',
    };
    return colors[language] || '#8b8b8b';
}
