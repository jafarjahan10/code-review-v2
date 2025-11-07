import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * This endpoint fixes existing candidate passwords by:
 * 1. Finding all candidates with User accounts that have plain text passwords
 * 2. Hashing the plain text passwords in the User table
 * 3. Keeping plain text passwords in Candidate table for admin display
 * 
 * Run this once to fix existing data after the authentication update
 */
export async function POST() {
    try {
        const session = await auth();
        if (!session || session.user.userType !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all candidates
        const candidates = await prisma.candidate.findMany({
            select: {
                email: true,
                password: true,
            },
        });

        let updated = 0;
        let errors = 0;

        // Update each candidate's User password
        for (const candidate of candidates) {
            try {
                // Check if user exists
                const user = await prisma.user.findUnique({
                    where: { 
                        email: candidate.email,
                    },
                });

                if (user && user.userType === 'CANDIDATE' && user.password) {
                    // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
                    if (!user.password.startsWith('$2')) {
                        // Password is plain text, hash it
                        const hashedPassword = await bcrypt.hash(candidate.password, 10);
                        
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { password: hashedPassword },
                        });
                        
                        updated++;
                    }
                }
            } catch (error) {
                console.error(`Error updating candidate ${candidate.email}:`, error);
                errors++;
            }
        }

        return NextResponse.json({
            message: 'Password fix completed',
            candidates: candidates.length,
            updated,
            errors,
        });
    } catch (error) {
        console.error('Error fixing passwords:', error);
        return NextResponse.json(
            { error: 'Failed to fix passwords' },
            { status: 500 }
        );
    }
}
