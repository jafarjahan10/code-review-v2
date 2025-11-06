import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth();

  return (
    <section>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session?.user.name || session?.user.email}!</p>
      <p>Use the navigation to manage problems, candidates, and submissions.</p>
      
      {session?.user.adminRole && (
        <div style={{ marginTop: 16, padding: 12, backgroundColor: "var(--muted)", borderRadius: 6 }}>
          <strong>Role:</strong> {session.user.adminRole}
        </div>
      )}
    </section>
  );
}
