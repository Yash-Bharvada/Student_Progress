import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserModel } from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import { Octokit } from 'octokit';

interface WeeklyContribution {
    week: string;
    commits: number;
}

interface LanguageStats {
    language: string;
    percentage: number;
}

interface RepoContribution {
    repository: string;
    commits: number;
}

interface ConsistencyScore {
    week: string;
    score: number;
}

async function getAuthenticatedUserWithToken() {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
        return null;
    }

    await dbConnect();
    const user = await UserModel.findById(sessionUser._id).select('+githubAccessToken');

    if (!user || !user.githubAccessToken) {
        return null;
    }

    return user;
}

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUserWithToken();

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Not authenticated or GitHub not connected'
            }, { status: 401 });
        }

        const octokit = new Octokit({ auth: user.githubAccessToken });

        // Fetch user's repositories
        const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 100,
            visibility: 'all'
        });

        // Calculate analytics
        const weeklyContributions: WeeklyContribution[] = [];
        const languageMap = new Map<string, number>();
        const repoContributions: RepoContribution[] = [];

        // Get commits from last 4 weeks
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

        for (const repo of repos.slice(0, 10)) { // Limit to top 10 repos to avoid rate limits
            try {
                // Get commits for this repo
                const { data: commits } = await octokit.rest.repos.listCommits({
                    owner: repo.owner.login,
                    repo: repo.name,
                    since: fourWeeksAgo.toISOString(),
                    author: user.username || undefined,
                    per_page: 100
                });

                // Count commits per week
                const commitsByWeek = new Map<number, number>();
                commits.forEach(commit => {
                    if (commit.commit.author?.date) {
                        const commitDate = new Date(commit.commit.author.date);
                        const weekNumber = Math.floor((Date.now() - commitDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
                        if (weekNumber >= 0 && weekNumber < 4) {
                            commitsByWeek.set(weekNumber, (commitsByWeek.get(weekNumber) || 0) + 1);
                        }
                    }
                });

                // Track language stats
                if (repo.language) {
                    languageMap.set(repo.language, (languageMap.get(repo.language) || 0) + 1);
                }

                // Track repo contributions
                if (commits.length > 0) {
                    repoContributions.push({
                        repository: repo.name,
                        commits: commits.length
                    });
                }

                // Aggregate weekly contributions
                commitsByWeek.forEach((count, weekNum) => {
                    const weekLabel = `Week ${4 - weekNum}`;
                    const existing = weeklyContributions.find(w => w.week === weekLabel);
                    if (existing) {
                        existing.commits += count;
                    } else {
                        weeklyContributions.push({ week: weekLabel, commits: count });
                    }
                });

            } catch (error) {
                console.error(`Error fetching commits for ${repo.name}:`, error);
            }
        }

        // Sort weekly contributions
        weeklyContributions.sort((a, b) => {
            const weekA = parseInt(a.week.split(' ')[1]);
            const weekB = parseInt(b.week.split(' ')[1]);
            return weekA - weekB;
        });

        // Ensure we have 4 weeks
        for (let i = 1; i <= 4; i++) {
            const weekLabel = `Week ${i}`;
            if (!weeklyContributions.find(w => w.week === weekLabel)) {
                weeklyContributions.push({ week: weekLabel, commits: 0 });
            }
        }
        weeklyContributions.sort((a, b) => {
            const weekA = parseInt(a.week.split(' ')[1]);
            const weekB = parseInt(b.week.split(' ')[1]);
            return weekA - weekB;
        });

        // Calculate language distribution percentages
        const totalRepos = Array.from(languageMap.values()).reduce((sum, count) => sum + count, 0);
        const languageDistribution: LanguageStats[] = Array.from(languageMap.entries())
            .map(([language, count]) => ({
                language,
                percentage: Math.round((count / totalRepos) * 100)
            }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5);

        // Sort repo contributions
        repoContributions.sort((a, b) => b.commits - a.commits);

        // Calculate consistency scores (based on commit frequency)
        const consistencyTrend: ConsistencyScore[] = weeklyContributions.map(week => {
            // Score based on commits: 0-5 commits = low, 6-15 = medium, 16+ = high
            let score = 0;
            if (week.commits === 0) score = 0;
            else if (week.commits <= 5) score = 50 + (week.commits * 5);
            else if (week.commits <= 15) score = 75 + ((week.commits - 5) * 2);
            else score = Math.min(95, 90 + (week.commits - 15));

            return {
                week: week.week,
                score: Math.round(score)
            };
        });

        return NextResponse.json({
            success: true,
            weeklyContributions,
            languageDistribution,
            repositoryContributions: repoContributions.slice(0, 5),
            consistencyTrend
        });

    } catch (error: any) {
        console.error('Analytics API error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch analytics'
        }, { status: 500 });
    }
}
