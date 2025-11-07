import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const updateStackSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
});

// PATCH /api/admin/stacks/[id] - Update stack
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
        const validatedData = updateStackSchema.parse(body);

        // Check if stack exists
        const existingStack = await prisma.stack.findUnique({
            where: { id },
        });

        if (!existingStack) {
            return NextResponse.json(
                { error: 'Stack not found' },
                { status: 404 }
            );
        }

        // Check if name is already taken by another stack
        if (validatedData.name !== existingStack.name) {
            const duplicateStack = await prisma.stack.findUnique({
                where: { name: validatedData.name },
            });

            if (duplicateStack) {
                return NextResponse.json(
                    { error: 'Stack with this name already exists' },
                    { status: 400 }
                );
            }
        }

        const updatedStack = await prisma.stack.update({
            where: { id },
            data: {
                name: validatedData.name,
                description: validatedData.description,
            },
        });

        return NextResponse.json(updatedStack);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error updating stack:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/stacks/[id] - Delete stack
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

        // Check if stack exists
        const existingStack = await prisma.stack.findUnique({
            where: { id },
        });

        if (!existingStack) {
            return NextResponse.json(
                { error: 'Stack not found' },
                { status: 404 }
            );
        }

        await prisma.stack.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Stack deleted successfully' });
    } catch (error) {
        console.error('Error deleting stack:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
