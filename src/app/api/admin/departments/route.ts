import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const createDepartmentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
});

// GET /api/admin/departments - Get all departments with pagination and search
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

        const [departments, total] = await Promise.all([
            prisma.department.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.department.count({ where }),
        ]);

        return NextResponse.json({
            departments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/admin/departments - Create new department
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Only ADMIN role can create departments
        if (session.user.adminRole !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden: Only admins can create departments' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = createDepartmentSchema.parse(body);

        // Check if department already exists
        const existingDepartment = await prisma.department.findUnique({
            where: { name: validatedData.name },
        });

        if (existingDepartment) {
            return NextResponse.json(
                { error: 'Department with this name already exists' },
                { status: 400 }
            );
        }

        const department = await prisma.department.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
            },
        });

        return NextResponse.json(department, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error creating department:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
