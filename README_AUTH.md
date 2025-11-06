# Authentication Setup

This application uses **Auth.js (NextAuth.js v5)** with **Prisma** and **PostgreSQL** for authentication.

## Features

- Email/password authentication using credentials provider
- Role-based access control with two user types:
  - **ADMIN**: Access to `/admin/*` routes
  - **CANDIDATE**: Access to candidate routes (`/`)
- Admin users have additional roles: `ADMIN` or `USER`
- Protected routes using middleware
- Separate login pages for admin (`/admin/login`) and candidates (`/login`)

## Database Schema

The Prisma schema includes:
- `User` model with `userType` (ADMIN/CANDIDATE) and `adminRole` (ADMIN/USER)
- `Account`, `Session`, and `VerificationToken` models for Auth.js
- Password field for credential-based authentication

## Environment Variables

Required in `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/code_review_db
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

Generate a secure secret:
```powershell
openssl rand -base64 32
```

## Test Users

Run the seed script to create test users:

```powershell
npm run prisma:seed
```

This creates:

| Email | Password | Type | Role |
|-------|----------|------|------|
| admin@example.com | admin123 | ADMIN | ADMIN |
| user@example.com | admin123 | ADMIN | USER |
| candidate@example.com | candidate123 | CANDIDATE | - |

## Usage

### Sign In

- **Admins**: Navigate to `/admin/login`
- **Candidates**: Navigate to `/login`

### Sign Out

Use the `signOut()` function from `next-auth/react`:

```tsx
import { signOut } from "next-auth/react";

<button onClick={() => signOut({ callbackUrl: "/login" })}>
  Sign Out
</button>
```

### Get Session (Client Component)

```tsx
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;
  
  return <div>Welcome {session.user.name}!</div>;
}
```

### Get Session (Server Component)

```tsx
import { auth } from "@/lib/auth";

export default async function MyPage() {
  const session = await auth();
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Welcome {session.user.name}!</div>;
}
```

### Access User Data

The session includes:
- `session.user.id` - User ID
- `session.user.email` - Email
- `session.user.name` - Name
- `session.user.userType` - "ADMIN" or "CANDIDATE"
- `session.user.adminRole` - "ADMIN" or "USER" (for admin users only)

## Route Protection

The middleware (`src/middleware.ts`) automatically:
- Redirects unauthenticated users to login pages
- Restricts `/admin/*` routes to ADMIN users only
- Restricts candidate routes to CANDIDATE users only
- Redirects admins accessing candidate routes to `/admin`
- Redirects candidates accessing admin routes to `/login`

## Creating New Users

### Via Prisma

```tsx
import { PrismaClient, UserType, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hashedPassword = await bcrypt.hash("password123", 10);

await prisma.user.create({
  data: {
    email: "newuser@example.com",
    name: "New User",
    password: hashedPassword,
    userType: UserType.CANDIDATE,
  },
});
```

### Via API Route (recommended)

Create an API route for user registration:

```tsx
// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { email, password, name } = await request.json();
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      userType: "CANDIDATE",
    },
  });
  
  return NextResponse.json({ id: user.id, email: user.email });
}
```

## Troubleshooting

### "Invalid email or password" error
- Verify the user exists in the database
- Check password was hashed correctly (use bcrypt with 10 rounds)
- Run the seed script to create test users

### Middleware redirect loops
- Ensure login pages (`/login`, `/admin/login`) are in the public routes list
- Check that `NEXTAUTH_URL` matches your app URL

### Session not persisting
- Verify `NEXTAUTH_SECRET` is set in `.env`
- Clear browser cookies and try again
- Check database for Session records

## Next Steps

- Add registration pages for candidates
- Implement password reset flow
- Add email verification
- Enhance admin role permissions (restrict certain admin pages by role)
- Add OAuth providers (Google, GitHub, etc.)
