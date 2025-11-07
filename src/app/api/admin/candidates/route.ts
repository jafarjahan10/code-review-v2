import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { generatePassword } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '5');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where = search
            ? {
                  OR: [
                      {
                          name: {
                              contains: search,
                              mode: 'insensitive' as const,
                          },
                      },
                      {
                          email: {
                              contains: search,
                              mode: 'insensitive' as const,
                          },
                      },
                  ],
              }
            : {};

        const [candidates, total] = await Promise.all([
            prisma.candidate.findMany({
                where,
                include: {
                    department: true,
                    position: true,
                    problem: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.candidate.count({ where }),
        ]);

        return NextResponse.json({
            candidates,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching candidates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch candidates' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            name,
            email,
            departmentId,
            positionId,
            problemId,
            scheduledTime,
        } = body;

        // Validate required fields
        if (
            !name ||
            !email ||
            !departmentId ||
            !positionId ||
            !problemId ||
            !scheduledTime
        ) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingCandidate = await prisma.candidate.findUnique({
            where: { email },
        });

        if (existingCandidate) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Generate 5-letter random password
        const plainPassword = generatePassword(5);
        // Store plain text password for candidates (not hashed)
        // Hash password for User table authentication
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Check if user already exists with this email
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Create both User and Candidate in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user account for authentication
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword, // Store hashed password for security
                    userType: 'CANDIDATE',
                    adminRole: null, // No admin access
                },
            });

            // Create candidate
            const candidate = await tx.candidate.create({
                data: {
                    name,
                    email,
                    password: plainPassword, // Store plain text password for admin display
                    departmentId,
                    positionId,
                    problemId,
                    scheduledTime: new Date(scheduledTime),
                },
                include: {
                    department: true,
                    position: true,
                    problem: true,
                },
            });

            return { user, candidate };
        });

        // Return candidate with plain password
        return NextResponse.json(
            {
                candidate: result.candidate,
                generatedPassword: plainPassword,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating candidate:', error);
        return NextResponse.json(
            { error: 'Failed to create candidate' },
            { status: 500 }
        );
    }
}
