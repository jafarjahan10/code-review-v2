import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const session = await auth();
        
        if (!session || session.user.userType !== 'CANDIDATE') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { answers } = body; // Array of { stackId, code }

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'Invalid answers format' },
                { status: 400 }
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

        // Check if test was started
        if (!candidate.startTime) {
            return NextResponse.json(
                { error: 'Test not started' },
                { status: 400 }
            );
        }

        // Create submission
        const submission = await prisma.submission.create({
            data: {
                candidateId: candidate.id,
                problemId: candidate.problemId,
                positionId: candidate.positionId,
                submissionTime: new Date(),
                answers: answers,
                remarks: [],
            },
        });

        // Update candidate submission time
        await prisma.candidate.update({
            where: { id: candidate.id },
            data: { submissionTime: new Date() },
        });

        return NextResponse.json({
            message: 'Submission successful',
            submission,
        });
    } catch (error) {
        console.error('Error submitting test:', error);
        return NextResponse.json(
            { error: 'Failed to submit test' },
            { status: 500 }
        );
    }
}
