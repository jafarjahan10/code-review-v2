import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

// GET /api/admin/dashboard - Get dashboard statistics
export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get counts
        const [
            totalCandidates,
            totalSubmissions,
            totalProblems,
            totalDepartments,
            totalPositions,
            totalStacks,
            submittedCandidates,
            pendingCandidates,
        ] = await Promise.all([
            prisma.candidate.count(),
            prisma.submission.count(),
            prisma.problem.count(),
            prisma.department.count(),
            prisma.position.count(),
            prisma.stack.count(),
            prisma.candidate.count({
                where: {
                    submissionTime: {
                        not: null,
                    },
                },
            }),
            prisma.candidate.count({
                where: {
                    submissionTime: null,
                },
            }),
        ]);

        // Get recent candidates
        const recentCandidates = await prisma.candidate.findMany({
            take: 3,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                department: true,
                position: true,
                problem: true,
            },
        });

        // Get recent submissions
        const recentSubmissions = await prisma.submission.findMany({
            take: 3,
            orderBy: {
                submissionTime: 'desc',
            },
            include: {
                candidate: {
                    include: {
                        problem: true,
                        position: true,
                        department: true,
                    },
                },
            },
        });

        // Get candidates by department
        const candidatesByDepartment = await prisma.department.findMany({
            include: {
                _count: {
                    select: {
                        candidates: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        // Get problems by difficulty
        const problemsByDifficulty = await prisma.problem.groupBy({
            by: ['difficulty'],
            _count: {
                difficulty: true,
            },
        });

        // Get submission trends (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const submissionTrends = await prisma.submission.groupBy({
            by: ['submissionTime'],
            where: {
                submissionTime: {
                    gte: sevenDaysAgo,
                },
            },
            _count: {
                id: true,
            },
        });

        // Process submission trends by day
        const dailySubmissions = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];

            const count = submissionTrends.filter(s => {
                const submissionDate = new Date(s.submissionTime)
                    .toISOString()
                    .split('T')[0];
                return submissionDate === dateStr;
            }).length;

            return {
                date: dateStr,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                submissions: count,
            };
        });

        // Get candidate registration trends (last 7 days)
        const candidateTrends = await prisma.candidate.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
            _count: {
                id: true,
            },
        });

        const dailyCandidates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];

            const count = candidateTrends.filter(c => {
                const candidateDate = new Date(c.createdAt)
                    .toISOString()
                    .split('T')[0];
                return candidateDate === dateStr;
            }).length;

            return {
                date: dateStr,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                candidates: count,
            };
        });

        // Get problems by position
        const problemsByPosition = await prisma.position.findMany({
            include: {
                _count: {
                    select: {
                        problems: true,
                    },
                },
            },
            take: 5,
            orderBy: {
                problems: {
                    _count: 'desc',
                },
            },
        });

        return NextResponse.json({
            stats: {
                totalCandidates,
                totalSubmissions,
                totalProblems,
                totalDepartments,
                totalPositions,
                totalStacks,
                submittedCandidates,
                pendingCandidates,
            },
            recentCandidates,
            recentSubmissions,
            candidatesByDepartment: candidatesByDepartment.map(dept => ({
                name: dept.name,
                count: dept._count.candidates,
            })),
            problemsByDifficulty: problemsByDifficulty.map(p => ({
                difficulty: p.difficulty,
                count: p._count.difficulty,
            })),
            submissionTrends: dailySubmissions,
            candidateTrends: dailyCandidates,
            problemsByPosition: problemsByPosition.map(pos => ({
                name: pos.name,
                problems: pos._count.problems,
            })),
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
