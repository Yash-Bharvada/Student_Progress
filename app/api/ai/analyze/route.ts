import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AIAnalysis from '@/models/AIAnalysis';
import { getFileContent, getAllCodeFiles, parseGitHubUrl, detectLanguage } from '@/lib/github';
import { analyzeCode } from '@/lib/gemini';
import { getCurrentUser } from '@/lib/auth';
import { UserModel } from '@/lib/models/User';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        const { repositoryUrl, maxFiles = 20 } = await request.json();

        if (!repositoryUrl) {
            return NextResponse.json(
                { error: 'Repository URL is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // 1. Get authenticated user and token
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const userWithToken = await UserModel.findById(user._id).select('+githubAccessToken');
        const accessToken = userWithToken?.githubAccessToken;

        // 2. Parse GitHub URL
        let repoInfo;
        try {
            repoInfo = parseGitHubUrl(repositoryUrl);
        } catch (error: any) {
            return NextResponse.json(
                { error: 'Invalid GitHub URL', details: error.message },
                { status: 400 }
            );
        }

        // 3. Get or create repository record
        // Ideally checking/creating a Repository doc here. For now we generate a new ID if not strictly linked to a Repos collection yet
        // If you have a Repository model, fetch it here:
        // const repository = await Repository.findOne({ owner: repoInfo.owner, name: repoInfo.repo });
        const repositoryId = new mongoose.Types.ObjectId();

        // 4. Get all code files from repository
        console.log(`📂 Fetching files from ${repoInfo.owner}/${repoInfo.repo}...`);
        let codeFiles;
        try {
            codeFiles = await getAllCodeFiles(
                repoInfo.owner,
                repoInfo.repo,
                repoInfo.branch,
                accessToken
            );
        } catch (error: any) {
            return NextResponse.json(
                { error: 'Failed to fetch repository', details: error.message },
                { status: 404 }
            );
        }

        if (codeFiles.length === 0) {
            return NextResponse.json(
                { error: 'No code files found in repository' },
                { status: 404 }
            );
        }

        // Limit number of files
        const filesToAnalyze = codeFiles.slice(0, maxFiles);
        console.log(`📊 Found ${codeFiles.length} files, analyzing ${filesToAnalyze.length}...`);

        // 5. Analyze files in real-time
        const results = [];
        const errors = [];

        for (let i = 0; i < filesToAnalyze.length; i++) {
            const filePath = filesToAnalyze[i];

            try {
                console.log(`[${i + 1}/${filesToAnalyze.length}] Analyzing ${filePath}...`);

                // Fetch file content
                const fileContent = await getFileContent(
                    repoInfo.owner,
                    repoInfo.repo,
                    filePath,
                    accessToken
                );

                // Detect language
                const language = detectLanguage(filePath);

                // Analyze with Gemini
                const analysis = await analyzeCode(fileContent, language);

                // Save to database
                const savedAnalysis = await AIAnalysis.create({
                    studentId: user._id,
                    repositoryId,
                    repository: `${repoInfo.owner}/${repoInfo.repo}`,
                    filePath,
                    language,
                    score: analysis.score,
                    strengths: analysis.strengths,
                    issues: analysis.issues,
                    suggestions: analysis.suggestions,
                    analyzedAt: new Date(),
                });

                results.push({
                    filePath,
                    language,
                    analysis,
                    _id: savedAnalysis._id,
                });

                // Add delay to avoid rate limits (TPM is low on free tier)
                if (i < filesToAnalyze.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

            } catch (error: any) {
                console.error(`❌ Error analyzing ${filePath}:`, error.message);
                errors.push({
                    filePath,
                    error: error.message,
                });
            }
        }

        // 6. Calculate overall statistics
        const scores = results.map(r => r.analysis.score);
        const averageScore = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;

        return NextResponse.json({
            success: true,
            repository: `${repoInfo.owner}/${repoInfo.repo}`,
            summary: {
                totalFiles: codeFiles.length,
                analyzedFiles: results.length,
                failedFiles: errors.length,
                averageScore: Math.round(averageScore * 10) / 10,
                excellentFiles: results.filter(r => r.analysis.score >= 9).length,
                goodFiles: results.filter(r => r.analysis.score >= 7 && r.analysis.score < 9).length,
                averageFiles: results.filter(r => r.analysis.score >= 5 && r.analysis.score < 7).length,
                poorFiles: results.filter(r => r.analysis.score < 5).length,
            },
            results,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error: any) {
        console.error('Repository analysis error:', error);
        return NextResponse.json(
            {
                error: 'Analysis failed',
                details: error.message
            },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve existing analysis
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const repositoryId = searchParams.get('repositoryId');

        if (!repositoryId) {
            return NextResponse.json(
                { error: 'repositoryId parameter required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const analyses = await AIAnalysis.find({
            repositoryId: new mongoose.Types.ObjectId(repositoryId)
        })
            .sort({ score: -1 })
            .lean();

        if (analyses.length === 0) {
            return NextResponse.json(
                { error: 'No analysis found for this repository' },
                { status: 404 }
            );
        }

        const scores = analyses.map(a => a.score);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        return NextResponse.json({
            success: true,
            repository: analyses[0].repository,
            summary: {
                totalFiles: analyses.length,
                averageScore: Math.round(averageScore * 10) / 10,
                excellentFiles: analyses.filter(a => a.score >= 9).length,
                goodFiles: analyses.filter(a => a.score >= 7 && a.score < 9).length,
                averageFiles: analyses.filter(a => a.score >= 5 && a.score < 7).length,
                poorFiles: analyses.filter(a => a.score < 5).length,
            },
            files: analyses,
        });

    } catch (error: any) {
        console.error('Error fetching analysis:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analysis', details: error.message },
            { status: 500 }
        );
    }
}
