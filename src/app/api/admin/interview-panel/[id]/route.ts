import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

const updateUserSchema = z.object({
    adminRole: z.enum(['ADMIN', 'USER']),
});

// PATCH /api/admin/interview-panel/[id] - Update user role
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

        // Only ADMIN role can update users
        if (session.user.adminRole !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden: Only admins can update user roles' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = updateUserSchema.parse(body);

        // Check if user exists and is an ADMIN type
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser || existingUser.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent user from changing their own role
        if (existingUser.id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot change your own role' },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { adminRole: validatedData.adminRole },
            select: {
                id: true,
                name: true,
                email: true,
                adminRole: true,
                createdAt: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/interview-panel/[id] - Delete user
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

        // Only ADMIN role can delete users
        if (session.user.adminRole !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden: Only admins can delete users' },
                { status: 403 }
            );
        }

        const { id } = await params;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser || existingUser.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent user from deleting themselves
        if (existingUser.id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
