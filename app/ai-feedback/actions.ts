"use server";

import { analyzeCode, CodeAnalysisResult } from "@/lib/gemini";
import { getCurrentUser } from "@/lib/auth";
import { UserModel } from "@/lib/models/User";
import dbConnect from "@/lib/mongodb";
import { Octokit } from "octokit";

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
  default_branch: string;
}

async function getAuthenticatedUserWithToken() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    throw new Error("Not authenticated");
  }

  await dbConnect();
  const user = await UserModel.findById(sessionUser._id).select('+githubAccessToken');

  if (!user || !user.githubAccessToken) {
    throw new Error("GitHub account not connected or token check failed");
  }

  return user;
}

export async function getUserRepositories(): Promise<Repository[]> {
  try {
    const user = await getAuthenticatedUserWithToken();
    const octokit = new Octokit({ auth: user.githubAccessToken });

    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
      visibility: 'all' // Get both public and private
    });

    return data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url
      },
      default_branch: repo.default_branch
    }));

  } catch (error) {
    console.error("Failed to fetch repositories:", error);
    return [];
  }
}

export async function analyzeRepositoryCode(repoFullName: string, filePath: string): Promise<CodeAnalysisResult> {
  try {
    const user = await getAuthenticatedUserWithToken();
    const octokit = new Octokit({ auth: user.githubAccessToken });

    const [owner, repo] = repoFullName.split('/');

    let content = "";
    let language = "";

    // 1. Fetch file content
    try {
      if (filePath === "__FULL_ANALYSIS__") {
        // Fetch repo details to get default branch
        const { data: repoData } = await octokit.rest.repos.get({
          owner,
          repo
        });
        const defaultBranch = repoData.default_branch;

        // Fetch repository tree to find list of files
        const { data: treeData } = await octokit.rest.git.getTree({
          owner,
          repo,
          tree_sha: defaultBranch,
          recursive: 'true'
        });

        // Filter for code files, excluding excessively large ones or generated code
        const codeFiles = treeData.tree.filter((file: any) => {
          return file.type === 'blob' &&
            (file.path.endsWith('.ts') || file.path.endsWith('.tsx') || file.path.endsWith('.js') || file.path.endsWith('.py') || file.path.endsWith('.css')) &&
            !file.path.includes('node_modules') &&
            !file.path.includes('.next') &&
            !file.path.includes('dist');
        }).slice(0, 5); // Limit to top 5 files to avoid token limits for now

        // Fetch content for each
        const fileContents = await Promise.all(codeFiles.map(async (file: any) => {
          try {
            const { data } = await octokit.rest.repos.getContent({
              owner,
              repo,
              path: file.path,
            });
            if ('content' in data) {
              return `\n\n--- FILE: ${file.path} ---\n` + Buffer.from(data.content, 'base64').toString('utf-8');
            }
          } catch (e) { return ""; }
          return "";
        }));

        content = `FULL CODEBASE ANALYSIS (Sample of ${codeFiles.length} files):\n` + fileContents.join("");
        language = "typescript"; // Default to TS for syntax highlighting estimation
      } else {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: filePath,
        });

        if (Array.isArray(data) || !('content' in data)) {
          throw new Error("Path is a directory, not a file");
        }

        content = Buffer.from(data.content, 'base64').toString('utf-8');
        language = filePath.split('.').pop() || 'text';
      }

    } catch (error: any) {
      console.error("Error fetching file:", error);
      if (error.status === 409) {
        return {
          score: 0,
          strengths: [],
          issues: ["Repository is empty"],
          suggestions: ["Push some code to generate analysis"]
        };
      }
      if (error.status === 404) {
        throw new Error(`File '${filePath}' not found in repository. Please check the path.`);
      }
      throw new Error(`Failed to fetch file: ${filePath}. ${error.message}`);
    }

    // 2. Analyze with Gemini
    return await analyzeCode(content, language);

  } catch (error: any) {
    console.error("Analysis failed:", error);
    throw error; // Re-throw to be handled by UI
  }
}
