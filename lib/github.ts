import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';

const GITHUB_APP_ID = process.env.GITHUB_APP_ID || '';
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY || '';
const GITHUB_INSTALLATION_ID = process.env.GITHUB_INSTALLATION_ID || '';

if (!GITHUB_APP_ID || !GITHUB_PRIVATE_KEY) {
    console.warn(
        'GitHub App credentials not configured. Some features may not work.'
    );
}

export async function getOctokitClient(): Promise<Octokit> {
    // If Installation ID is not set, return a basic client (won't work for authenticated requests)
    if (!GITHUB_INSTALLATION_ID || GITHUB_INSTALLATION_ID === 'your_installation_id_here') {
        console.warn('GitHub Installation ID not set. Using unauthenticated client.');
        return new Octokit();
    }

    const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: GITHUB_APP_ID,
            privateKey: GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
            installationId: GITHUB_INSTALLATION_ID,
        },
    });

    return octokit;
}

/**
 * Create an Octokit client authenticated with a user's OAuth token
 * This allows making API calls on behalf of a specific user
 */
export function getUserOctokitClient(accessToken: string): Octokit {
    return new Octokit({
        auth: accessToken,
    });
}

export async function getUserRepositories(username: string, accessToken?: string) {
    try {
        // Use user-specific token if provided, otherwise fall back to app auth
        const octokit = accessToken
            ? getUserOctokitClient(accessToken)
            : await getOctokitClient();

        const { data: repos } = await octokit.rest.repos.listForUser({
            username,
            per_page: 100,
            sort: 'updated',
        });

        return repos.map((repo) => ({
            name: repo.name,
            fullName: repo.full_name,
            isPrivate: repo.private,
            language: repo.language || 'Unknown',
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            description: repo.description,
            lastUpdated: new Date(repo.updated_at || Date.now()),
            createdAt: new Date(repo.created_at || Date.now()),
        }));
    } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
    }
}

export async function getCommitHistory(
    owner: string,
    repo: string,
    author?: string,
    accessToken?: string
) {
    try {
        // Use user-specific token if provided, otherwise fall back to app auth
        const octokit = accessToken
            ? getUserOctokitClient(accessToken)
            : await getOctokitClient();

        const { data: commits } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            author,
            per_page: 100,
        });

        return commits.map((commit) => ({
            sha: commit.sha,
            message: commit.commit.message,
            author: {
                name: commit.commit.author?.name || 'Unknown',
                email: commit.commit.author?.email || '',
                avatar: commit.author?.avatar_url,
            },
            timestamp: new Date(commit.commit.author?.date || Date.now()),
            url: commit.html_url,
        }));
    } catch (error: any) {
        // Handle empty repository (409 Conflict)
        if (error.status === 409) {
            return [];
        }
        console.error('Error fetching commit history:', error);
        throw error;
    }
}

export async function getCommitDetails(
    owner: string,
    repo: string,
    sha: string
) {
    try {
        const octokit = await getOctokitClient();

        const { data: commit } = await octokit.rest.repos.getCommit({
            owner,
            repo,
            ref: sha,
        });

        return {
            additions: commit.stats?.additions || 0,
            deletions: commit.stats?.deletions || 0,
            filesChanged: commit.files?.length || 0,
        };
    } catch (error) {
        console.error('Error fetching commit details:', error);
        return {
            additions: 0,
            deletions: 0,
            filesChanged: 0,
        };
    }
}

export async function getPullRequests(
    owner: string,
    repo: string,
    author?: string
) {
    try {
        const octokit = await getOctokitClient();

        const { data: prs } = await octokit.rest.pulls.list({
            owner,
            repo,
            state: 'all',
            per_page: 100,
        });

        // Filter by author if provided
        const filteredPRs = author
            ? prs.filter((pr) => pr.user?.login === author)
            : prs;

        return filteredPRs.map((pr) => ({
            number: pr.number,
            title: pr.title,
            state: pr.state,
            createdAt: new Date(pr.created_at),
            closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
            mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
            author: pr.user?.login || 'Unknown',
            url: pr.html_url,
        }));
    } catch (error) {
        console.error('Error fetching pull requests:', error);
        throw error;
    }
}

export async function getFileContent(
    owner: string,
    repo: string,
    path: string,
    accessToken?: string
) {
    try {
        // Use user-specific token if provided, otherwise fall back to app auth
        const octokit = accessToken
            ? getUserOctokitClient(accessToken)
            : await getOctokitClient();

        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
        });

        if ('content' in data) {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            return content;
        }

        throw new Error('File content not found');
    } catch (error) {
        console.error('Error fetching file content:', error);
        throw error;
    }
}

// Parse GitHub URL to extract owner/repo
export function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string } {
    try {
        let cleanUrl = url.trim();

        // Handle SSH format
        if (cleanUrl.startsWith('git@github.com:')) {
            cleanUrl = cleanUrl.replace('git@github.com:', 'https://github.com/');
        }

        // Remove .git suffix
        cleanUrl = cleanUrl.replace(/\.git$/, '');

        const urlObj = new URL(cleanUrl);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        if (pathParts.length < 2) {
            throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo');
        }

        return {
            owner: pathParts[0],
            repo: pathParts[1],
            branch: 'main',
        };
    } catch (error) {
        throw new Error(`Failed to parse GitHub URL: ${url}`);
    }
}

// Get all code files from repository
export async function getAllCodeFiles(
    owner: string,
    repo: string,
    branch: string = 'main',
    accessToken?: string
): Promise<string[]> {
    try {
        const octokit = accessToken
            ? getUserOctokitClient(accessToken)
            : await getOctokitClient();

        // Get repository tree
        const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
        const defaultBranch = repoData.default_branch;

        const { data } = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: defaultBranch,
            recursive: '1',
        });

        // Filter for code files
        const codeExtensions = [
            '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
            '.go', '.rb', '.php', '.swift', '.kt', '.rs', '.scala', '.dart',
            '.vue', '.svelte', '.html', '.css', '.scss'
        ];

        return data.tree
            .filter((item: any) => {
                if (item.type !== 'blob') return false;
                return codeExtensions.some(ext => item.path?.toLowerCase().endsWith(ext));
            })
            .map((item: any) => item.path!)
            .filter(Boolean);
    } catch (error: any) {
        // Handle 404 specifically
        if (error.status === 404) {
            throw new Error(`Repository not found: ${owner}/${repo}. Check if it exists and you have access.`);
        }
        throw new Error(`Failed to fetch repository files: ${error.message}`);
    }
}

// Detect language from file extension
export function detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
        js: 'JavaScript',
        jsx: 'JavaScript',
        ts: 'TypeScript',
        tsx: 'TypeScript',
        py: 'Python',
        java: 'Java',
        cpp: 'C++',
        c: 'C',
        cs: 'C#',
        go: 'Go',
        rb: 'Ruby',
        php: 'PHP',
        swift: 'Swift',
        kt: 'Kotlin',
        rs: 'Rust',
        scala: 'Scala',
        dart: 'Dart',
        vue: 'Vue',
        svelte: 'Svelte',
        html: 'HTML',
        css: 'CSS',
        scss: 'SCSS',
    };
    return languageMap[ext || ''] || 'Unknown';
}

export async function getGitHubUser(username: string) {
    try {
        const octokit = await getOctokitClient();

        const { data: user } = await octokit.rest.users.getByUsername({
            username,
        });

        return {
            id: user.id,
            login: user.login,
            name: user.name || user.login,
            email: user.email || '',
            avatar: user.avatar_url,
        };
    } catch (error) {
        console.error('Error fetching GitHub user:', error);
        throw error;
    }
}

export async function getAuthenticatedUser(accessToken: string) {
    try {
        const octokit = new Octokit({
            auth: accessToken,
        });

        const { data: user } = await octokit.rest.users.getAuthenticated();

        return {
            id: user.id,
            login: user.login,
            name: user.name || user.login,
            email: user.email || '',
            avatar: user.avatar_url,
        };
    } catch (error) {
        console.error('Error fetching authenticated user:', error);
        throw error;
    }
}

// Helper function to get installation ID (for setup)
export async function getAppInstallations() {
    try {
        if (!GITHUB_APP_ID || !GITHUB_PRIVATE_KEY) {
            throw new Error('GitHub App credentials not configured');
        }

        const octokit = new Octokit({
            authStrategy: createAppAuth,
            auth: {
                appId: GITHUB_APP_ID,
                privateKey: GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
        });

        const { data: installations } = await octokit.rest.apps.listInstallations();

        return installations.map((installation) => ({
            id: installation.id,
            account: installation.account?.login || 'Unknown',
            targetType: installation.target_type,
        }));
    } catch (error) {
        console.error('Error fetching installations:', error);
        throw error;
    }
}
