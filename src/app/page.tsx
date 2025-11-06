import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/sign-out-button';

export default async function Home() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    return (
        <main style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1>Welcome, {session.user.name || session.user.email}!</h1>
                <SignOutButton />
            </div>
            <p>This is the candidate dashboard.</p>
            <p>Your assigned problems and submissions will appear here.</p>

            <div
                style={{
                    marginTop: 24,
                    padding: 16,
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                }}
            >
                <h2>Session Info</h2>
                <pre style={{ fontSize: 12 }}>
                    {JSON.stringify(session.user, null, 2)}
                </pre>
            </div>
        </main>
    );
}
