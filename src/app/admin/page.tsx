'use client';

import { useQuery } from '@tanstack/react-query';
import {
    Users,
    FileCheck,
    FileCode,
    Building2,
    TrendingUp,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    Pie,
    PieChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
    totalCandidates: number;
    totalSubmissions: number;
    totalProblems: number;
    totalDepartments: number;
    totalPositions: number;
    totalStacks: number;
    submittedCandidates: number;
    pendingCandidates: number;
}

interface RecentCandidate {
    id: string;
    name: string;
    email: string;
    scheduledTime: string;
    submissionTime: string | null;
    department: { name: string };
    position: { name: string };
    problem: { title: string };
}

interface RecentSubmission {
    id: string;
    submissionTime: string;
    candidate: {
        name: string;
        email: string;
        problem: { title: string; difficulty: string };
        position: { name: string };
        department: { name: string };
    };
}

interface DepartmentCount {
    name: string;
    count: number;
}

interface ProblemDifficulty {
    difficulty: string;
    count: number;
}

interface TrendData {
    date: string;
    day: string;
    submissions?: number;
    candidates?: number;
}

interface PositionProblems {
    name: string;
    problems: number;
}

interface DashboardData {
    stats: DashboardStats;
    recentCandidates: RecentCandidate[];
    recentSubmissions: RecentSubmission[];
    candidatesByDepartment: DepartmentCount[];
    problemsByDifficulty: ProblemDifficulty[];
    submissionTrends: TrendData[];
    candidateTrends: TrendData[];
    problemsByPosition: PositionProblems[];
}

function getAvatarGradient(name: string): string {
    const gradients = [
        'bg-gradient-to-br from-purple-400 to-pink-600',
        'bg-gradient-to-br from-blue-400 to-cyan-600',
        'bg-gradient-to-br from-green-400 to-emerald-600',
        'bg-gradient-to-br from-orange-400 to-red-600',
        'bg-gradient-to-br from-yellow-400 to-amber-600',
        'bg-gradient-to-br from-indigo-400 to-purple-600',
        'bg-gradient-to-br from-pink-400 to-rose-600',
        'bg-gradient-to-br from-teal-400 to-green-600',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
        case 'EASY':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'MEDIUM':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'HARD':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
}

export default function AdminPage() {
    const router = useRouter();

    const { data, isLoading } = useQuery<DashboardData>({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const response = await fetch('/api/admin/dashboard');
            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">
                    Failed to load dashboard data
                </p>
            </div>
        );
    }

    const stats = [
        {
            title: 'Total Candidates',
            value: data.stats.totalCandidates,
            icon: Users,
            description: `${data.stats.submittedCandidates} submitted, ${data.stats.pendingCandidates} pending`,
            color: 'text-blue-600',
        },
        {
            title: 'Total Submissions',
            value: data.stats.totalSubmissions,
            icon: FileCheck,
            description: 'Code reviews completed',
            color: 'text-green-600',
        },
        {
            title: 'Total Problems',
            value: data.stats.totalProblems,
            icon: FileCode,
            description: 'Available challenges',
            color: 'text-purple-600',
        },
        {
            title: 'Departments',
            value: data.stats.totalDepartments,
            icon: Building2,
            description: `${data.stats.totalPositions} positions`,
            color: 'text-orange-600',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of your code review platform
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stat.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Candidates */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Candidates</CardTitle>
                        <CardDescription>
                            Latest registered candidates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.recentCandidates.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No candidates yet
                                </p>
                            ) : (
                                data.recentCandidates.map(candidate => (
                                    <div
                                        key={candidate.id}
                                        className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                                        onClick={() =>
                                            router.push(
                                                `/admin/candidates/${candidate.id}`
                                            )
                                        }
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback
                                                className={getAvatarGradient(
                                                    candidate.name
                                                )}
                                            >
                                                <span className="text-white font-semibold">
                                                    {getInitials(
                                                        candidate.name
                                                    )}
                                                </span>
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {candidate.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {candidate.department.name} •{' '}
                                                {candidate.position.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {candidate.submissionTime ? (
                                                <Badge variant="default">
                                                    Submitted
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    Pending
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Submissions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Submissions</CardTitle>
                        <CardDescription>
                            Latest code submissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.recentSubmissions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No submissions yet
                                </p>
                            ) : (
                                data.recentSubmissions.map(submission => (
                                    <div
                                        key={submission.id}
                                        className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                                        onClick={() =>
                                            router.push(
                                                `/admin/submissions/${submission.id}`
                                            )
                                        }
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback
                                                className={getAvatarGradient(
                                                    submission.candidate.name
                                                )}
                                            >
                                                <span className="text-white font-semibold">
                                                    {getInitials(
                                                        submission.candidate
                                                            .name
                                                    )}
                                                </span>
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {submission.candidate.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    submission.candidate.problem
                                                        .title
                                                }
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                className={getDifficultyColor(
                                                    submission.candidate.problem
                                                        .difficulty
                                                )}
                                                variant="secondary"
                                            >
                                                {
                                                    submission.candidate.problem
                                                        .difficulty
                                                }
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Candidates by Department */}
                <Card>
                    <CardHeader>
                        <CardTitle>Candidates by Department</CardTitle>
                        <CardDescription>
                            Distribution across departments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.candidatesByDepartment.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No data available
                                </p>
                            ) : (
                                data.candidatesByDepartment.map(
                                    (dept, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">
                                                    {dept.name}
                                                </span>
                                            </div>
                                            <Badge variant="secondary">
                                                {dept.count}
                                            </Badge>
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Problems by Difficulty */}
                <Card>
                    <CardHeader>
                        <CardTitle>Problems by Difficulty</CardTitle>
                        <CardDescription>
                            Challenge difficulty distribution
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.problemsByDifficulty.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No problems available
                                </p>
                            ) : (
                                data.problemsByDifficulty.map(
                                    (problem, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">
                                                    {problem.difficulty}
                                                </span>
                                            </div>
                                            <Badge
                                                className={getDifficultyColor(
                                                    problem.difficulty
                                                )}
                                                variant="secondary"
                                            >
                                                {problem.count}
                                            </Badge>
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Submission Trends Line Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Submission Trends</CardTitle>
                        <CardDescription>
                            Last 7 days submission activity
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.submissionTrends.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No submission data available
                            </p>
                        ) : (
                            <ChartContainer
                                config={{
                                    submissions: {
                                        label: 'Submissions',
                                        color: 'hsl(var(--chart-1))',
                                    },
                                }}
                                className="h-[300px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.submissionTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="day"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="submissions"
                                            stroke="hsl(var(--chart-1))"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Candidate Registration Trends Line Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Candidate Registration Trends</CardTitle>
                        <CardDescription>
                            Last 7 days registration activity
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.candidateTrends.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No candidate data available
                            </p>
                        ) : (
                            <ChartContainer
                                config={{
                                    candidates: {
                                        label: 'Candidates',
                                        color: 'hsl(var(--chart-2))',
                                    },
                                }}
                                className="h-[300px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.candidateTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="day"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="candidates"
                                            stroke="hsl(var(--chart-2))"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* More Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Candidates by Department Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Candidates by Department</CardTitle>
                        <CardDescription>
                            Distribution visualization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.candidatesByDepartment.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No department data available
                            </p>
                        ) : (
                            <ChartContainer
                                config={{
                                    count: {
                                        label: 'Candidates',
                                        color: 'hsl(280, 85%, 60%)',
                                    },
                                }}
                                className="h-[300px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data.candidatesByDepartment}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="hsl(280, 85%, 60%)"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Problems by Difficulty Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Problems by Difficulty</CardTitle>
                        <CardDescription>
                            Difficulty level distribution
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.problemsByDifficulty.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No problem data available
                            </p>
                        ) : (
                            <ChartContainer
                                config={{
                                    EASY: {
                                        label: 'Easy',
                                        color: 'hsl(142, 76%, 36%)',
                                    },
                                    MEDIUM: {
                                        label: 'Medium',
                                        color: 'hsl(48, 96%, 53%)',
                                    },
                                    HARD: {
                                        label: 'Hard',
                                        color: 'hsl(0, 84%, 60%)',
                                    },
                                }}
                                className="h-[300px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <Pie
                                            data={data.problemsByDifficulty}
                                            dataKey="count"
                                            nameKey="difficulty"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {data.problemsByDifficulty.map(
                                                (entry, index) => {
                                                    const colors = {
                                                        EASY: 'hsl(142, 76%, 36%)',
                                                        MEDIUM: 'hsl(48, 96%, 53%)',
                                                        HARD: 'hsl(0, 84%, 60%)',
                                                    };
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                colors[
                                                                    entry.difficulty as keyof typeof colors
                                                                ] ||
                                                                'hsl(var(--chart-1))'
                                                            }
                                                        />
                                                    );
                                                }
                                            )}
                                        </Pie>
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Problems by Position Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Problems by Position</CardTitle>
                    <CardDescription>
                        Top 5 positions with most problems
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data.problemsByPosition.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No position data available
                        </p>
                    ) : (
                        <ChartContainer
                            config={{
                                problems: {
                                    label: 'Problems',
                                    color: 'hsl(440, 82%, 52%)',
                                },
                            }}
                            className="h-[300px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data.problemsByPosition}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        type="number"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        width={100}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="problems"
                                        fill="hsl(440, 82%, 52%)"
                                        radius={[0, 8, 8, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
