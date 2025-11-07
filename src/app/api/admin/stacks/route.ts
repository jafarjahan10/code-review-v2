import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const createStackSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
});

// GET /api/admin/stacks - Get all stacks with pagination and search
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

        const [stacks, total] = await Promise.all([
            prisma.stack.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.stack.count({ where }),
        ]);

        return NextResponse.json({
            stacks,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching stacks:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/admin/stacks - Create new stack
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
        const validatedData = createStackSchema.parse(body);

        // Check if stack already exists
        const existingStack = await prisma.stack.findUnique({
            where: { name: validatedData.name },
        });

        if (existingStack) {
            return NextResponse.json(
                { error: 'Stack with this name already exists' },
                { status: 400 }
            );
        }

        const stack = await prisma.stack.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
            },
        });

        return NextResponse.json(stack, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error creating stack:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
