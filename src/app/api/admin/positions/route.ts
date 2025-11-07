import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const createPositionSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    departmentId: z.string().min(1, 'Department is required'),
});

// GET /api/admin/positions - Get all positions with pagination and search
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
                    { name: { contains: search, mode: 'insensitive' as const } },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }),
        };

        const [positions, total] = await Promise.all([
            prisma.position.findMany({
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
                },
            }),
            prisma.position.count({ where }),
        ]);

        return NextResponse.json({
            positions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching positions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/admin/positions - Create new position
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
        const validatedData = createPositionSchema.parse(body);

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

        // Check if position with same name already exists in this department
        const existingPosition = await prisma.position.findUnique({
            where: {
                name_departmentId: {
                    name: validatedData.name,
                    departmentId: validatedData.departmentId,
                },
            },
        });

        if (existingPosition) {
            return NextResponse.json(
                { error: 'Position with this name already exists in this department' },
                { status: 400 }
            );
        }

        const position = await prisma.position.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                departmentId: validatedData.departmentId,
            },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(position, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error creating position:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
