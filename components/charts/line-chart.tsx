'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface LineChartProps {
    title: string;
    data: Array<Record<string, string | number>>;
    xKey: string;
    yKeys: { key: string; color: string; name: string }[];
}

export function LineChart({ title, data, xKey, yKeys }: LineChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey={xKey}
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        {yKeys.map((yKey) => (
                            <Line
                                key={yKey.key}
                                type="monotone"
                                dataKey={yKey.key}
                                stroke={yKey.color}
                                strokeWidth={2}
                                name={yKey.name}
                                dot={{ fill: yKey.color, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </RechartsLineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
