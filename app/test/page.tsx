'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPage() {
    const [dbStatus, setDbStatus] = useState<string>('Not tested');
    const [githubStatus, setGitHubStatus] = useState<string>('Not tested');
    const [githubUser, setGitHubUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testDatabase = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            setDbStatus(data.success ? '✅ Connected' : '❌ Failed');
        } catch (error) {
            setDbStatus('❌ Error: ' + String(error));
        }
        setLoading(false);
    };

    const testGitHub = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test-github?username=octocat');
            const data = await response.json();
            if (data.success) {
                setGitHubStatus('✅ Connected');
                setGitHubUser(data.user);
            } else {
                setGitHubStatus('❌ Failed: ' + data.error);
            }
        } catch (error) {
            setGitHubStatus('❌ Error: ' + String(error));
        }
        setLoading(false);
    };

    return (
        <div className="flex-1 overflow-auto">
            <div className="p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">API Integration Tests</h1>
                    <p className="text-muted-foreground mt-1">
                        Test your MongoDB and GitHub API connections
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Database Test */}
                    <Card>
                        <CardHeader>
                            <CardTitle>MongoDB Connection</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status:</span>
                                <span className="text-sm">{dbStatus}</span>
                            </div>
                            <button
                                onClick={testDatabase}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            >
                                Test Database Connection
                            </button>
                        </CardContent>
                    </Card>

                    {/* GitHub Test */}
                    <Card>
                        <CardHeader>
                            <CardTitle>GitHub API</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status:</span>
                                <span className="text-sm">{githubStatus}</span>
                            </div>
                            <button
                                onClick={testGitHub}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            >
                                Test GitHub API
                            </button>
                            {githubUser && (
                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-medium">Test User: {githubUser.name}</p>
                                    <p className="text-xs text-muted-foreground">@{githubUser.login}</p>
                                    <p className="text-xs text-muted-foreground">ID: {githubUser.id}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Environment Variables</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">MongoDB URI:</span>
                                <span className="text-muted-foreground">
                                    {process.env.MONGODB_URI ? '✅ Configured' : '❌ Missing'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Gemini API Key:</span>
                                <span className="text-muted-foreground">
                                    {process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">GitHub Token:</span>
                                <span className="text-muted-foreground">
                                    {process.env.GITHUB_API_TOKEN ? '✅ Configured' : '❌ Missing'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Next Steps
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>1. Make sure MongoDB is running locally on port 27017</li>
                        <li>2. Verify your GitHub Personal Access Token has the correct permissions</li>
                        <li>3. Test the sync endpoint: POST /api/github/sync with a GitHub username</li>
                        <li>4. Test AI analysis: POST /api/ai/analyze with repository ID and file path</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
