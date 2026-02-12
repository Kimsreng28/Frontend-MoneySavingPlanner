'use client';

import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecommendationsCardProps {
    recommendations: string[];
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
    const getIcon = (index: number) => {
        const icons = [
            <Lightbulb key="lightbulb" className="h-4 w-4" />,
            <TrendingUp key="trending" className="h-4 w-4" />,
            <Target key="target" className="h-4 w-4" />,
            <CheckCircle2 key="check" className="h-4 w-4" />,
            <AlertCircle key="alert" className="h-4 w-4" />,
        ];
        return icons[index % icons.length];
    };

    const getColor = (index: number) => {
        const colors = [
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        ];
        return colors[index % colors.length];
    };

    if (recommendations.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Recommendations
                    </CardTitle>
                    <CardDescription>AI-powered insights for your savings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Lightbulb className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                            No recommendations at this time. Keep up the good work!
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Recommendations
                </CardTitle>
                <CardDescription>AI-powered insights for your savings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {recommendations.map((recommendation, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-all"
                    >
                        <div className={cn('p-2 rounded-full', getColor(index))}>
                            {getIcon(index)}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm">{recommendation}</p>
                        </div>
                    </motion.div>
                ))}
            </CardContent>
        </Card>
    );
}