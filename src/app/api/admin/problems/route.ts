import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const createProblemSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    departmentId: z.string().min(1, 'Department is required'),
    positionId: z.string().min(1, 'Position is required'),
    stackIds: z.array(z.string()).min(1, 'At least one stack is required'),
});

// GET /api/admin/problems - Get all problems with pagination and search
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '5');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where = {
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' as const } },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }),
        };

        const [problems, total] = await Promise.all([
            prisma.problem.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    department: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    position: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    stacks: {
                        include: {
                            stack: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.problem.count({ where }),
        ]);

        return NextResponse.json({
            problems,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching problems:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/admin/problems - Create new problem
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
        const validatedData = createProblemSchema.parse(body);

        // Check if department exists
        const department = await prisma.department.findUnique({
            where: { id: validatedData.departmentId },
        });

        if (!department) {
            return NextResponse.json(
                { error: 'Department not found' },
                { status: 404 }
            );
        }

        // Check if position exists and belongs to the department
        const position = await prisma.position.findUnique({
            where: { id: validatedData.positionId },
        });

        if (!position) {
            return NextResponse.json(
                { error: 'Position not found' },
                { status: 404 }
            );
        }

        if (position.departmentId !== validatedData.departmentId) {
            return NextResponse.json(
                { error: 'Position does not belong to the selected department' },
                { status: 400 }
            );
        }

        // Check if all stacks exist
        const stacks = await prisma.stack.findMany({
            where: {
                id: {
                    in: validatedData.stackIds,
                },
            },
        });

        if (stacks.length !== validatedData.stackIds.length) {
            return NextResponse.json(
                { error: 'One or more stacks not found' },
                { status: 404 }
            );
        }

        // Create problem with stacks
        const problem = await prisma.problem.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                difficulty: validatedData.difficulty,
                departmentId: validatedData.departmentId,
                positionId: validatedData.positionId,
                stacks: {
                    create: validatedData.stackIds.map((stackId) => ({
                        stackId,
                    })),
                },
            },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                position: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                stacks: {
                    include: {
                        stack: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(problem, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error creating problem:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
