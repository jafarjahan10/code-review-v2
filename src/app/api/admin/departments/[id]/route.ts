import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const updateDepartmentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
});

// PATCH /api/admin/departments/[id] - Update department
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

        // Only ADMIN role can update departments
        if (session.user.adminRole !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden: Only admins can update departments' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = updateDepartmentSchema.parse(body);

        // Check if department exists
        const existingDepartment = await prisma.department.findUnique({
            where: { id },
        });

        if (!existingDepartment) {
            return NextResponse.json(
                { error: 'Department not found' },
                { status: 404 }
            );
        }

        // Check if name is already taken by another department
        if (validatedData.name !== existingDepartment.name) {
            const duplicateDepartment = await prisma.department.findUnique({
                where: { name: validatedData.name },
            });

            if (duplicateDepartment) {
                return NextResponse.json(
                    { error: 'Department with this name already exists' },
                    { status: 400 }
                );
            }
        }

        const updatedDepartment = await prisma.department.update({
            where: { id },
            data: {
                name: validatedData.name,
                description: validatedData.description,
            },
        });

        return NextResponse.json(updatedDepartment);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error updating department:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/departments/[id] - Delete department
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

        // Only ADMIN role can delete departments
        if (session.user.adminRole !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden: Only admins can delete departments' },
                { status: 403 }
            );
        }

        const { id } = await params;

        // Check if department exists
        const existingDepartment = await prisma.department.findUnique({
            where: { id },
        });

        if (!existingDepartment) {
            return NextResponse.json(
                { error: 'Department not found' },
                { status: 404 }
            );
        }

        await prisma.department.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error('Error deleting department:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
