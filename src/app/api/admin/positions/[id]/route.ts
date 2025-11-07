import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const updatePositionSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    departmentId: z.string().min(1, 'Department is required'),
});

// PATCH /api/admin/positions/[id] - Update position
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
        const validatedData = updatePositionSchema.parse(body);

        // Check if position exists
        const existingPosition = await prisma.position.findUnique({
            where: { id },
        });

        if (!existingPosition) {
            return NextResponse.json(
                { error: 'Position not found' },
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

        // Check if name is already taken by another position in the same department
        if (
            validatedData.name !== existingPosition.name ||
            validatedData.departmentId !== existingPosition.departmentId
        ) {
            const duplicatePosition = await prisma.position.findUnique({
                where: {
                    name_departmentId: {
                        name: validatedData.name,
                        departmentId: validatedData.departmentId,
                    },
                },
            });

            if (duplicatePosition && duplicatePosition.id !== id) {
                return NextResponse.json(
                    { error: 'Position with this name already exists in this department' },
                    { status: 400 }
                );
            }
        }

        const updatedPosition = await prisma.position.update({
            where: { id },
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

        return NextResponse.json(updatedPosition);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error updating position:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/positions/[id] - Delete position
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

        // Check if position exists
        const existingPosition = await prisma.position.findUnique({
            where: { id },
        });

        if (!existingPosition) {
            return NextResponse.json(
                { error: 'Position not found' },
                { status: 404 }
            );
        }

        await prisma.position.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Position deleted successfully' });
    } catch (error) {
        console.error('Error deleting position:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
