import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

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
        const { remark, recommendedForNextStep, remarkId, action } = body;

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

        const remarks = Array.isArray(submission.remarks)
            ? (submission.remarks as Array<{
                  id: string;
                  text: string;
                  adminName: string;
                  adminEmail: string;
                  createdAt: string;
                  updatedAt?: string;
              }>)
            : [];

        let updatedRemarks = [...remarks];

        // Handle different actions
        if (action === 'edit' && remarkId) {
            // Edit existing remark
            if (!remark || !remark.text) {
                return NextResponse.json(
                    { error: 'Remark text is required' },
                    { status: 400 }
                );
            }

            const remarkIndex = updatedRemarks.findIndex(r => r.id === remarkId);
            if (remarkIndex === -1) {
                return NextResponse.json(
                    { error: 'Remark not found' },
                    { status: 404 }
                );
            }

            // Check if the admin owns this remark
            if (updatedRemarks[remarkIndex].adminEmail !== session.user.email) {
                return NextResponse.json(
                    { error: 'You can only edit your own remarks' },
                    { status: 403 }
                );
            }

            updatedRemarks[remarkIndex] = {
                ...updatedRemarks[remarkIndex],
                text: remark.text,
                updatedAt: new Date().toISOString(),
            };
        } else if (action === 'delete' && remarkId) {
            // Delete existing remark
            const remarkToDelete = updatedRemarks.find(r => r.id === remarkId);
            if (!remarkToDelete) {
                return NextResponse.json(
                    { error: 'Remark not found' },
                    { status: 404 }
                );
            }

            // Check if the admin owns this remark
            if (remarkToDelete.adminEmail !== session.user.email) {
                return NextResponse.json(
                    { error: 'You can only delete your own remarks' },
                    { status: 403 }
                );
            }

            updatedRemarks = updatedRemarks.filter(r => r.id !== remarkId);
        } else if (action === 'updateRecommendation') {
            // Update recommendation status only
            if (typeof recommendedForNextStep !== 'boolean') {
                return NextResponse.json(
                    { error: 'Recommendation status is required' },
                    { status: 400 }
                );
            }
            // Keep existing remarks, only update recommendation status
            updatedRemarks = remarks;
        } else {
            // Add new remark (default behavior)
            if (!remark || !remark.text) {
                return NextResponse.json(
                    { error: 'Remark text is required' },
                    { status: 400 }
                );
            }

            const newRemark = {
                id: `remark_${Date.now()}`,
                text: remark.text,
                adminName: session.user.name || session.user.email || 'Admin',
                adminEmail: session.user.email || '',
                createdAt: new Date().toISOString(),
            };

            updatedRemarks = [...remarks, newRemark];
        }

        const updatedSubmission = await prisma.submission.update({
            where: { id },
            data: {
                remarks: updatedRemarks,
                ...(typeof recommendedForNextStep === 'boolean' && {
                    recommendedForNextStep,
                }),
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
