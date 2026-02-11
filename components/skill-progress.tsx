'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';

interface Skill {
    language: string;
    proficiency: number;
    color: string;
}

interface SkillProgressProps {
    skills: Skill[];
}

export function SkillProgress({ skills }: SkillProgressProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Skill Development</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {skills.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No skills tracked yet
                        </p>
                    ) : (
                        skills.map((skill) => (
                            <div key={skill.language} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{skill.language}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round(skill.proficiency)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn('h-full rounded-full transition-all')}
                                        style={{
                                            width: `${skill.proficiency}%`,
                                            backgroundColor: skill.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
