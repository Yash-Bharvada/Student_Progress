import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: LucideIcon;
    iconColor?: string;
}

export function MetricCard({
    title,
    value,
    change,
    icon: Icon,
    iconColor = 'text-blue-500',
}: MetricCardProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <h2 className="text-3xl font-bold">{value}</h2>
                            {change !== undefined && (
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        change >= 0 ? 'text-green-600' : 'text-red-600'
                                    )}
                                >
                                    {change >= 0 ? '+' : ''}
                                    {change}%
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={cn('p-3 rounded-lg bg-opacity-10', iconColor)}>
                        <Icon className={cn('h-6 w-6', iconColor)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
