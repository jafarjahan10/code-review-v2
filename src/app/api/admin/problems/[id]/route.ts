import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const updateProblemSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    departmentId: z.string().min(1, 'Department is required'),
    positionId: z.string().min(1, 'Position is required'),
    stackIds: z.array(z.string()).min(1, 'At least one stack is required'),
});

// GET /api/admin/problems/[id] - Get single problem
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const problem = await prisma.problem.findUnique({
            where: { id },
            include: {
                department: true,
                position: true,
                stacks: {
                    include: {
                        stack: true,
                    },
                },
            },
        });

        if (!problem) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(problem);
    } catch (error) {
        console.error('Error fetching problem:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/problems/[id] - Update problem
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = updateProblemSchema.parse(body);

        // Check if problem exists
        const existingProblem = await prisma.problem.findUnique({
            where: { id },
        });

        if (!existingProblem) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

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

        // Delete existing stack relations and create new ones
        await prisma.problemStack.deleteMany({
            where: { problemId: id },
        });

        // Update problem
        const updatedProblem = await prisma.problem.update({
            where: { id },
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

        return NextResponse.json(updatedProblem);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error updating problem:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/problems/[id] - Delete problem
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if problem exists
        const existingProblem = await prisma.problem.findUnique({
            where: { id },
        });

        if (!existingProblem) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        await prisma.problem.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Problem deleted successfully' });
    } catch (error) {
        console.error('Error deleting problem:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
