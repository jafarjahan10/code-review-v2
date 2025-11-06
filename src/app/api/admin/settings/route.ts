import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    image: z.string().url('Invalid image URL').optional().or(z.literal('')),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

// GET /api/admin/settings - Get current user profile
export async function GET() {
    try {
        const session = await auth();

        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                userType: true,
                adminRole: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/settings - Update user profile
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = updateProfileSchema.parse(body);

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // If trying to change password, verify current password
        if (validatedData.newPassword) {
            if (!validatedData.currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required to set a new password' },
                    { status: 400 }
                );
            }

            if (!currentUser.password) {
                return NextResponse.json(
                    { error: 'No password set for this account' },
                    { status: 400 }
                );
            }

            const isPasswordValid = await bcrypt.compare(
                validatedData.currentPassword,
                currentUser.password
            );

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 400 }
                );
            }
        }

        // Prepare update data
        const updateData: {
            name?: string;
            image?: string | null;
            password?: string;
        } = {};

        if (validatedData.name !== undefined) {
            updateData.name = validatedData.name;
        }

        if (validatedData.image !== undefined) {
            updateData.image = validatedData.image || null;
        }

        if (validatedData.newPassword) {
            const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
            updateData.password = hashedPassword;
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                userType: true,
                adminRole: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            user: updatedUser,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error updating user profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
