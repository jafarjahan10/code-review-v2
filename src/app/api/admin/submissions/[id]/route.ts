import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET /api/admin/submissions/[id] - Get a single submission
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

        const submission = await prisma.submission.findUnique({
            where: { id },
            include: {
                candidate: {
                    include: {
                        problem: {
                            include: {
                                stacks: {
                                    include: {
                                        stack: true,
                                    },
                                },
                            },
                        },
                        position: true,
                        department: true,
                    },
                },
            },
        });

        if (!submission) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(submission);
    } catch (error) {
        console.error('Error fetching submission:', error);
        return NextResponse.json(
            { error: 'Failed to fetch submission' },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/submissions/[id] - Add a remark to a submission
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
        const { remark } = body;

        if (!remark || !remark.text) {
            return NextResponse.json(
                { error: 'Remark text is required' },
                { status: 400 }
            );
        }

        // Get current submission
        const submission = await prisma.submission.findUnique({
            where: { id },
        });

        if (!submission) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            );
        }

        // Add new remark with timestamp and admin info
        const remarks = Array.isArray(submission.remarks)
            ? submission.remarks
            : [];
        const newRemark = {
            id: `remark_${Date.now()}`,
            text: remark.text,
            adminName: session.user.name || session.user.email || 'Admin',
            adminEmail: session.user.email || '',
            createdAt: new Date().toISOString(),
        };

        const updatedSubmission = await prisma.submission.update({
            where: { id },
            data: {
                remarks: [...remarks, newRemark] as Prisma.InputJsonValue,
            },
            include: {
                candidate: {
                    include: {
                        problem: {
                            include: {
                                stacks: {
                                    include: {
                                        stack: true,
                                    },
                                },
                            },
                        },
                        position: true,
                        department: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedSubmission);
    } catch (error) {
        console.error('Error updating submission:', error);
        return NextResponse.json(
            { error: 'Failed to update submission' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/submissions/[id] - Delete a submission
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

        await prisma.submission.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting submission:', error);
        return NextResponse.json(
            { error: 'Failed to delete submission' },
            { status: 500 }
        );
    }
}
