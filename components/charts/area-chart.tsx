'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
    AreaChart as RechartsAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface AreaChartProps {
    title: string;
    data: Array<Record<string, string | number>>;
    xKey: string;
    yKeys: { key: string; color: string; name: string }[];
}

export function AreaChart({ title, data, xKey, yKeys }: AreaChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsAreaChart data={data}>
                        <defs>
                            {yKeys.map((yKey) => (
                                <linearGradient
                                    key={yKey.key}
                                    id={`color${yKey.key}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="5%" stopColor={yKey.color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={yKey.color} stopOpacity={0.1} />
                                </linearGradient>
                            ))}
                        </defs>
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
                            <Area
                                key={yKey.key}
                                type="monotone"
                                dataKey={yKey.key}
                                stroke={yKey.color}
                                fillOpacity={1}
                                fill={`url(#color${yKey.key})`}
                                name={yKey.name}
                            />
                        ))}
                    </RechartsAreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
