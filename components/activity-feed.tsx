'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { GitCommit, GitPullRequest } from 'lucide-react';

interface Activity {
    id: string;
    type: 'commit' | 'pr';
    message: string;
    author?: {
        name: string;
        avatar?: string;
    };
    timestamp: Date;
    repository: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No recent activity
                        </p>
                    ) : (
                        activities.map((activity) => {
                            // Skip activities with missing author data
                            if (!activity.author) {
                                console.warn('Activity missing author:', activity.id);
                                return null;
                            }

                            return (
                                <div key={activity.id} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        {activity.author.avatar ? (
                                            <img
                                                src={activity.author.avatar}
                                                alt={activity.author.name || 'User'}
                                                className="h-10 w-10 rounded-full"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                                {activity.author.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {activity.type === 'commit' ? (
                                                <GitCommit className="h-4 w-4 text-blue-500" />
                                            ) : (
                                                <GitPullRequest className="h-4 w-4 text-purple-500" />
                                            )}
                                            <p className="text-sm font-medium">{activity.author.name || 'Unknown'}</p>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 truncate">
                                            {activity.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {activity.repository}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
