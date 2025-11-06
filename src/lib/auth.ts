import NextAuth, { type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient, UserType, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { Adapter } from 'next-auth/adapters';

const prisma = new PrismaClient();

// Extend the built-in session types
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            userType: UserType;
            adminRole?: AdminRole | null;
        } & DefaultSession['user'];
    }

    interface User {
        userType: UserType;
        adminRole?: AdminRole | null;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValidPassword) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    userType: user.userType,
                    adminRole: user.adminRole,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.userType = user.userType;
                token.adminRole = user.adminRole;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.userType = token.userType as UserType;
                session.user.adminRole = token.adminRole as AdminRole | null;
            }
            return session;
        },
    },
});
