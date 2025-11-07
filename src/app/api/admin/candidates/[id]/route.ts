import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { generatePassword } from '@/lib/utils';
import bcrypt from 'bcryptjs';

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

        const candidate = await prisma.candidate.findUnique({
            where: { id },
            include: {
                department: true,
                position: true,
                problem: true,
            },
        });

        if (!candidate) {
            return NextResponse.json(
                { error: 'Candidate not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(candidate);
    } catch (error) {
        console.error('Error fetching candidate:', error);
        return NextResponse.json(
            { error: 'Failed to fetch candidate' },
            { status: 500 }
        );
    }
}

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
        const {
            name,
            departmentId,
            positionId,
            problemId,
            scheduledTime,
            regeneratePassword,
        } = body;

        // Build update data
        const updateData: {
            name?: string;
            departmentId?: string;
            positionId?: string;
            problemId?: string;
            scheduledTime?: Date;
            password?: string;
        } = {
            ...(name && { name }),
            ...(departmentId && { departmentId }),
            ...(positionId && { positionId }),
            ...(problemId && { problemId }),
            ...(scheduledTime && { scheduledTime: new Date(scheduledTime) }),
        };

        let generatedPassword: string | undefined;

        // Handle password regeneration if requested
        if (regeneratePassword) {
            const plainPassword = generatePassword(5);
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            updateData.password = plainPassword; // Store plain text password in Candidate
            generatedPassword = plainPassword;

            // Also update User password with hashed version
            const candidate = await prisma.candidate.findUnique({
                where: { id },
                select: { email: true },
            });

            if (candidate?.email) {
                await prisma.user.updateMany({
                    where: { 
                        email: candidate.email,
                        userType: 'CANDIDATE' 
                    },
                    data: { password: hashedPassword },
                });
            }
        }

        const candidate = await prisma.candidate.update({
            where: { id },
            data: updateData,
            include: {
                department: true,
                position: true,
                problem: true,
            },
        });

        const response: {
            candidate: typeof candidate;
            generatedPassword?: string;
        } = { candidate };
        if (generatedPassword) {
            response.generatedPassword = generatedPassword;
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating candidate:', error);
        return NextResponse.json(
            { error: 'Failed to update candidate' },
            { status: 500 }
        );
    }
}

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

        // Get candidate email before deletion
        const candidate = await prisma.candidate.findUnique({
            where: { id },
            select: { email: true },
        });

        if (!candidate) {
            return NextResponse.json(
                { error: 'Candidate not found' },
                { status: 404 }
            );
        }

        // Delete both Candidate and User in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete candidate
            await tx.candidate.delete({
                where: { id },
            });

            // Delete associated user account
            await tx.user.deleteMany({
                where: { 
                    email: candidate.email,
                    userType: 'CANDIDATE' 
                },
            });
        });

        return NextResponse.json({ message: 'Candidate deleted successfully' });
    } catch (error) {
        console.error('Error deleting candidate:', error);
        return NextResponse.json(
            { error: 'Failed to delete candidate' },
            { status: 500 }
        );
    }
}
