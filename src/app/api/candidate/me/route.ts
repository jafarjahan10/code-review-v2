import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
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
            { error: 'Failed to fetch candidate data' },
            { status: 500 }
        );
    }
}
