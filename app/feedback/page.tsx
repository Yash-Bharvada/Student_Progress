'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Lightbulb, AlertTriangle } from 'lucide-react';

interface Repository {
    name: string;
    fullName: string;
    language: string;
}

export default function FeedbackPage() {
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<string>('');
    const [filePath, setFilePath] = useState<string>('README.md');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch user's repositories
        const fetchRepositories = async () => {
            try {
                const response = await fetch('/api/repositories');
                const data = await response.json();

                if (data.success) {
                    setRepositories(data.repositories);
                    if (data.repositories.length > 0) {
                        setSelectedRepo(data.repositories[0].fullName);
                    }
                }
            } catch (error) {
                console.error('Error fetching repositories:', error);
            }
        };

        fetchRepositories();
    }, []);

    const handleAnalyze = async () => {
        if (!selectedRepo || !filePath) {
            setError('Please select a repository and enter a file path');
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const [owner, repo] = selectedRepo.split('/');

            console.log('Analyzing:', { owner, repo, filePath });

            const response = await fetch(`/api/ai/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner,
                    repo,
                    filePath,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAnalysis(data.analysis);
            } else {
                setError(data.error || 'Failed to analyze code');
            }
        } catch (error) {
            setError(String(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-auto">
            <div className="p-8 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">AI-powered Code Quality Analysis</h1>
                    <p className="text-muted-foreground mt-1">
                        Get intelligent insights and suggestions for your code
                    </p>
                </div>

                {/* Repository Selector */}
                <Card>
                    <CardHeader>
                        <CardTitle>Select Repository and File</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Repository</label>
                            <select
                                value={selectedRepo}
                                onChange={(e) => setSelectedRepo(e.target.value)}
                                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                            >
                                {repositories.map((repo) => (
                                    <option key={repo.fullName} value={repo.fullName}>
                                        {repo.name} ({repo.language})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">File Path</label>
                            <input
                                type="text"
                                value={filePath}
                                onChange={(e) => setFilePath(e.target.value)}
                                placeholder="e.g., src/index.ts or README.md"
                                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Enter the path to a file in the repository (e.g., README.md, src/main.py)
                            </p>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !selectedRepo || !filePath}
                            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? 'Analyzing...' : 'Analyze Code Quality'}
                        </button>
                    </CardContent>
                </Card>

                {/* Error Message */}
                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                <p>{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Analysis Results */}
                {analysis && (
                    <>
                        {/* Quality Score */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Code Quality Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="text-5xl font-bold text-primary">
                                        {analysis.score}
                                        <span className="text-2xl text-muted-foreground">/10</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                                style={{ width: `${(analysis.score / 10) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            File: {filePath}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Insights Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Strengths */}
                            <Card className="border-green-200 bg-green-50/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-700">
                                        <CheckCircle className="h-5 w-5" />
                                        Strengths
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {analysis.strengths.map((strength: string, index: number) => (
                                            <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                                                <span className="text-green-500 mt-1">✓</span>
                                                <span>{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Issues */}
                            <Card className="border-yellow-200 bg-yellow-50/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-yellow-700">
                                        <AlertTriangle className="h-5 w-5" />
                                        Issues
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {analysis.issues.map((issue: string, index: number) => (
                                            <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                                                <span className="text-yellow-500 mt-1">⚠</span>
                                                <span>{issue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Suggestions */}
                            <Card className="border-blue-200 bg-blue-50/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-700">
                                        <Lightbulb className="h-5 w-5" />
                                        Suggestions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {analysis.suggestions.map((suggestion: string, index: number) => (
                                            <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                                                <span className="text-blue-500 mt-1">💡</span>
                                                <span>{suggestion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {!analysis && !loading && !error && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                Select a repository, enter a file path, and click "Analyze Code Quality" to get AI-powered insights
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
