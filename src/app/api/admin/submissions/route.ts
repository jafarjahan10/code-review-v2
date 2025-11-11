import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

// GET /api/admin/submissions - List all submissions with pagination and search
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '5');
        const search = searchParams.get('search') || '';
        const recommendation = searchParams.get('recommendation') || '';
        const difficulty = searchParams.get('difficulty') || '';
        const sortBy = searchParams.get('sortBy') || 'submissionTime';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const skip = (page - 1) * limit;

        // Build where clause for search and filters
        const where: Record<string, unknown> = {
            ...(search && {
                OR: [
                    {
                        candidate: {
                            name: {
                                contains: search,
                                mode: 'insensitive' as const,
                            },
                        },
                    },
                    {
                        candidate: {
                            email: {
                                contains: search,
                                mode: 'insensitive' as const,
                            },
                        },
                    },
                ],
            }),
            ...(difficulty && {
                candidate: {
                    problem: {
                        difficulty: difficulty
                    }
                }
            }),
        };

        // Build dynamic orderBy based on sortBy parameter
        let orderBy: Record<string, unknown>;
        if (sortBy === 'candidateName') {
            orderBy = {
                candidate: {
                    name: sortOrder
                }
            };
        } else {
            orderBy = {
                [sortBy]: sortOrder
            };
        }

        // Fetch all submissions matching basic criteria (search, difficulty)
        // Then filter by recommendation status in-memory since JSON filtering is complex
        const allSubmissions = await prisma.submission.findMany({
            where,
            include: {
                candidate: {
                    include: {
                        problem: true,
                        position: true,
                        department: true,
                    },
                },
            },
            orderBy,
        });

        // Filter by recommendation status
        let filteredSubmissions = allSubmissions;
        if (recommendation === 'recommended') {
            filteredSubmissions = allSubmissions.filter(
                s => s.recommendedForNextStep === true
            );
        } else if (recommendation === 'not-recommended') {
            filteredSubmissions = allSubmissions.filter(s => {
                const remarksArray = Array.isArray(s.remarks) ? s.remarks : [];
                return s.recommendedForNextStep === false && remarksArray.length > 0;
            });
        } else if (recommendation === 'pending') {
            filteredSubmissions = allSubmissions.filter(s => {
                const remarksArray = Array.isArray(s.remarks) ? s.remarks : [];
                return s.recommendedForNextStep === false && remarksArray.length === 0;
            });
        }

        // Apply pagination after filtering
        const total = filteredSubmissions.length;
        const submissions = filteredSubmissions.slice(skip, skip + limit);

        return NextResponse.json({
            submissions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
}

// POST /api/admin/submissions - Create a new submission (usually done by candidates, but admins can too)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { candidateId, problemId, positionId, submissionTime, answers } =
            body;

        // Validate required fields
        if (!candidateId || !problemId || !positionId || !answers) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const submission = await prisma.submission.create({
            data: {
                candidateId,
                problemId,
                positionId,
                submissionTime: submissionTime
                    ? new Date(submissionTime)
                    : new Date(),
                answers,
                remarks: [],
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

        return NextResponse.json(submission, { status: 201 });
    } catch (error) {
        console.error('Error creating submission:', error);
        return NextResponse.json(
            { error: 'Failed to create submission' },
            { status: 500 }
        );
    }
}
