import CandidatePortal from '@/components/candidate-portal';
import { ModeToggle } from '@/components/mode-toggle';
import SignOutButton from '@/components/sign-out-button';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen max-h-screen overflow-hidden">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container flex h-14 md:h-16 items-center justify-between px-3 md:px-4 mx-auto gap-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg md:text-2xl font-bold font-space">
                            CodeReview
                        </h1>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                        <ModeToggle />
                        <SignOutButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container px-3 md:px-4 py-4 md:py-6 mx-auto h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-y-auto scrollbar-thin">
                <CandidatePortal />
            </main>
        </div>
    );
}
