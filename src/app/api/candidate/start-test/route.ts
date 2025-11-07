import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST() {
    try {
        const session = await auth();
        
        if (!session || session.user.userType !== 'CANDIDATE') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find candidate by email
        const candidate = await prisma.candidate.findUnique({
            where: { email: session.user.email! },
        });

        if (!candidate) {
            return NextResponse.json(
                { error: 'Candidate not found' },
                { status: 404 }
            );
        }

        // Check if already started
        if (candidate.startTime) {
            return NextResponse.json(
                { error: 'Test already started' },
                { status: 400 }
            );
        }

        // Check if scheduled time has passed
        if (new Date() < candidate.scheduledTime) {
            return NextResponse.json(
                { error: 'Test not yet available' },
                { status: 400 }
            );
        }

        // Update start time
        const updatedCandidate = await prisma.candidate.update({
            where: { id: candidate.id },
            data: { startTime: new Date() },
            include: {
                department: true,
                position: true,
                problem: {
                    include: {
                        stacks: {
                            include: {
                                stack: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(updatedCandidate);
    } catch (error) {
        console.error('Error starting test:', error);
        return NextResponse.json(
            { error: 'Failed to start test' },
            { status: 500 }
        );
    }
}
