'use client';

import { useQuery } from '@tanstack/react-query';
import {
    Users,
    FileCheck,
    FileCode,
    Building2,
    TrendingUp,
    Activity,
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
    Area,
    AreaChart,
    Pie,
    PieChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import { DashboardSkeleton } from '@/components/skeletons';

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
            <div suppressHydrationWarning>
                <DashboardSkeleton />
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
        <div className="space-y-4 pb-6 px-4 lg:px-8">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
                <p className="text-sm lg:text-base text-muted-foreground">
                    Overview of your code review platform
                </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid gap-3 lg:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-12 auto-rows-auto lg:auto-rows-[140px]">
                {/* Stats Cards - Compact 4 columns on large screens */}
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="md:col-span-1 lg:col-span-3">
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

                {/* Submission Trends - Larger chart on left */}
                <Card className="md:col-span-2 lg:col-span-6 lg:row-span-2 overflow-hidden flex flex-col">
                    <CardHeader className="pb-2 lg:pb-3">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                    Submission Trends
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Last 7 days activity
                                </CardDescription>
                            </div>
                            {data.submissionTrends.length > 0 && (
                                <div className="text-left lg:text-right">
                                    <div className="text-lg lg:text-xl font-bold text-blue-600">
                                        {data.submissionTrends.reduce((sum, item) => sum + (item.submissions || 0), 0)}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Total</p>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pb-2 flex-1 min-h-[200px]">
                        {data.submissionTrends.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                                <FileCheck className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                <p className="text-xs text-muted-foreground text-center">
                                    No submission data available
                                </p>
                            </div>
                        ) : (
                            <ChartContainer
                                config={{
                                    submissions: {
                                        label: 'Submissions',
                                        color: 'hsl(217, 91%, 60%)',
                                    },
                                }}
                                className="w-full aspect-video md:aspect-3/2 lg:aspect-auto lg:h-full max-h-full"
                            >
                                <AreaChart data={data.submissionTrends} width={500} height={300}>
                                        <defs>
                                            <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                        <XAxis
                                            dataKey="day"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            stroke="hsl(var(--muted-foreground))"
                                        />
                                        <YAxis
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            stroke="hsl(var(--muted-foreground))"
                                            allowDecimals={false}
                                        />
                                        <ChartTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-background p-2 shadow-lg">
                                                            <div className="flex flex-col gap-1">
                                                                <p className="text-xs font-semibold">{payload[0].payload.date}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                                                                    <span className="text-xs text-muted-foreground">Submissions:</span>
                                                                    <span className="text-xs font-bold text-blue-600">{payload[0].value}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="submissions"
                                            stroke="hsl(217, 91%, 60%)"
                                            strokeWidth={2}
                                            fill="url(#colorSubmissions)"
                                            dot={{ r: 3, fill: "hsl(217, 91%, 60%)", strokeWidth: 1, stroke: "#fff" }}
                                            activeDot={{ r: 5, fill: "hsl(217, 91%, 60%)", strokeWidth: 2, stroke: "#fff" }}
                                        />
                                    </AreaChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Candidate Registration Trends - Larger chart on right */}
                <Card className="md:col-span-2 lg:col-span-6 lg:row-span-2 overflow-hidden flex flex-col">
                    <CardHeader className="pb-2 lg:pb-3">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
                                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                                    Candidate Registration
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Last 7 days activity
                                </CardDescription>
                            </div>
                            {data.candidateTrends.length > 0 && (
                                <div className="text-left lg:text-right">
                                    <div className="text-lg lg:text-xl font-bold text-emerald-600">
                                        {data.candidateTrends.reduce((sum, item) => sum + (item.candidates || 0), 0)}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Total</p>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pb-2 flex-1 min-h-[200px]">
                        {data.candidateTrends.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                                <Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                <p className="text-xs text-muted-foreground text-center">
                                    No candidate data available
                                </p>
                            </div>
                        ) : (
                            <ChartContainer
                                config={{
                                    candidates: {
                                        label: 'Candidates',
                                        color: 'hsl(142, 76%, 36%)',
                                    },
                                }}
                                className="w-full aspect-video md:aspect-3/2 lg:aspect-auto lg:h-full max-h-full"
                            >
                                <AreaChart data={data.candidateTrends} width={500} height={300}>
                                        <defs>
                                            <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                        <XAxis
                                            dataKey="day"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            stroke="hsl(var(--muted-foreground))"
                                        />
                                        <YAxis
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            stroke="hsl(var(--muted-foreground))"
                                            allowDecimals={false}
                                        />
                                        <ChartTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-background p-2 shadow-lg">
                                                            <div className="flex flex-col gap-1">
                                                                <p className="text-xs font-semibold">{payload[0].payload.date}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-2 w-2 rounded-full bg-emerald-600" />
                                                                    <span className="text-xs text-muted-foreground">Candidates:</span>
                                                                    <span className="text-xs font-bold text-emerald-600">{payload[0].value}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="candidates"
                                            stroke="hsl(142, 76%, 36%)"
                                            strokeWidth={2}
                                            fill="url(#colorCandidates)"
                                            dot={{ r: 3, fill: "hsl(142, 76%, 36%)", strokeWidth: 1, stroke: "#fff" }}
                                            activeDot={{ r: 5, fill: "hsl(142, 76%, 36%)", strokeWidth: 2, stroke: "#fff" }}
                                        />
                                    </AreaChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Candidates - Compact */}
                <Card className="md:col-span-2 lg:col-span-4 lg:row-span-2 overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm lg:text-base">Recent Candidates</CardTitle>
                        <CardDescription className="text-xs">
                            Latest registered
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-3">
                        <div className="space-y-2">
                            {data.recentCandidates.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-8">
                                    No candidates yet
                                </p>
                            ) : (
                                data.recentCandidates.map(candidate => (
                                    <div
                                        key={candidate.id}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded-md transition-colors"
                                        onClick={() =>
                                            router.push(
                                                `/admin/candidates/${candidate.id}`
                                            )
                                        }
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback
                                                className={getAvatarGradient(
                                                    candidate.name
                                                )}
                                            >
                                                <span className="text-white text-xs font-semibold">
                                                    {getInitials(
                                                        candidate.name
                                                    )}
                                                </span>
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium leading-none truncate">
                                                {candidate.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                                {candidate.department.name}
                                            </p>
                                        </div>
                                        <div>
                                            {candidate.submissionTime ? (
                                                <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                                                    Done
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
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

                {/* Recent Submissions - Compact */}
                <Card className="md:col-span-2 lg:col-span-4 lg:row-span-2 overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm lg:text-base">Recent Submissions</CardTitle>
                        <CardDescription className="text-xs">
                            Latest code submissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-3">
                        <div className="space-y-2">
                            {data.recentSubmissions.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-8">
                                    No submissions yet
                                </p>
                            ) : (
                                data.recentSubmissions.map(submission => (
                                    <div
                                        key={submission.id}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded-md transition-colors"
                                        onClick={() =>
                                            router.push(
                                                `/admin/submissions/${submission.id}`
                                            )
                                        }
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback
                                                className={getAvatarGradient(
                                                    submission.candidate.name
                                                )}
                                            >
                                                <span className="text-white text-xs font-semibold">
                                                    {getInitials(
                                                        submission.candidate
                                                            .name
                                                    )}
                                                </span>
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium leading-none truncate">
                                                {submission.candidate.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                                {
                                                    submission.candidate.problem
                                                        .title
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <Badge
                                                className={`${getDifficultyColor(
                                                    submission.candidate.problem
                                                        .difficulty
                                                )} h-5 px-1.5 text-[10px]`}
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

                {/* Candidates by Department - List View */}
                <Card className="md:col-span-2 lg:col-span-4 lg:row-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm lg:text-base">By Department</CardTitle>
                        <CardDescription className="text-xs">
                            Candidate distribution
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-3">
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {data.candidatesByDepartment.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-8">
                                    No data available
                                </p>
                            ) : (
                                data.candidatesByDepartment.map(
                                    (dept, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-1.5 px-2 hover:bg-muted/50 rounded-md transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs font-medium">
                                                    {dept.name}
                                                </span>
                                            </div>
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                                {dept.count}
                                            </Badge>
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Problems by Difficulty - Pie Chart */}
                <Card className="md:col-span-2 lg:col-span-6 lg:row-span-2 overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm lg:text-base">Problems by Difficulty</CardTitle>
                        <CardDescription className="text-xs">
                            Challenge distribution
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center overflow-hidden">
                        {data.problemsByDifficulty.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                                <FileCode className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                <p className="text-xs text-muted-foreground text-center">
                                    No problem data available
                                </p>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
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
                                    className="h-full w-full max-w-[400px] max-h-[200px]"
                                >
                                    <PieChart width={400} height={200}>
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
                                                innerRadius={50}
                                                // paddingAngle={2}
                                                label={(entry) => `${entry.difficulty}: ${entry.count}`}
                                                labelLine={{ stroke: 'hsl(var(--border))' }}
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
                                            {/* <Legend 
                                                wrapperStyle={{ fontSize: '12px' }}
                                                iconSize={10}
                                            /> */}
                                        </PieChart>
                                </ChartContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Candidates by Department Bar Chart */}
                <Card className="md:col-span-2 lg:col-span-6 lg:row-span-2 overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm lg:text-base">Candidates by Department</CardTitle>
                        <CardDescription className="text-xs">
                            Distribution overview
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 flex-1 min-h-[200px]">
                        {data.candidatesByDepartment.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                                <Building2 className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                <p className="text-xs text-muted-foreground text-center">
                                    No department data available
                                </p>
                            </div>
                        ) : (
                            <ChartContainer
                                config={{
                                    count: {
                                        label: 'Candidates',
                                        color: 'hsl(280, 85%, 60%)',
                                    },
                                }}
                                className="w-full aspect-video md:aspect-3/2 lg:aspect-auto lg:h-full max-h-full"
                            >
                                <BarChart
                                    data={data.candidatesByDepartment}
                                    width={500}
                                    height={300}
                                >
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                        <XAxis
                                            dataKey="name"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
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
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
