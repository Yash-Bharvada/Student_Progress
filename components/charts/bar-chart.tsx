'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface BarChartProps {
    title: string;
    data: Array<Record<string, string | number>>;
    xKey: string;
    yKeys: { key: string; color: string; name: string }[];
    layout?: 'horizontal' | 'vertical';
}

export function BarChart({
    title,
    data,
    xKey,
    yKeys,
    layout = 'horizontal',
}: BarChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={data} layout={layout}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        {layout === 'horizontal' ? (
                            <>
                                <XAxis
                                    dataKey={xKey}
                                    className="text-xs"
                                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <YAxis
                                    className="text-xs"
                                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                />
                            </>
                        ) : (
                            <>
                                <XAxis
                                    type="number"
                                    className="text-xs"
                                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <YAxis
                                    dataKey={xKey}
                                    type="category"
                                    className="text-xs"
                                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                />
                            </>
                        )}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        {yKeys.map((yKey) => (
                            <Bar
                                key={yKey.key}
                                dataKey={yKey.key}
                                fill={yKey.color}
                                name={yKey.name}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </RechartsBarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
