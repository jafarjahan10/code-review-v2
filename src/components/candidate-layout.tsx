'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ModeToggle } from '@/components/mode-toggle';
import SignOutButton from '@/components/sign-out-button';
import CandidatePortal from '@/components/candidate-portal';
import { Clock } from 'lucide-react';

interface Candidate {
    id: string;
    name: string;
    email: string;
    scheduledTime: string;
    endTime: string;
    startTime: string | null;
    submissionTime: string | null;
}

export default function CandidateLayout() {
    const [timer, setTimer] = useState<string>('');
    const [isOvertime, setIsOvertime] = useState(false);

    // Fetch candidate data
    const { data: candidate } = useQuery<Candidate>({
        queryKey: ['candidate-me'],
        queryFn: async () => {
            const response = await fetch('/api/candidate/me');
            if (!response.ok) throw new Error('Failed to fetch candidate data');
            return response.json();
        },
        refetchInterval: 5000, // Refetch every 5 seconds
    });

    // Timer logic
    useEffect(() => {
        if (!candidate || !candidate.startTime || candidate.submissionTime) {
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const endTime = new Date(candidate.endTime).getTime();
            const remaining = endTime - now;

            // Calculate hours, minutes, and seconds
            let hours: number;
            let minutes: number;
            let seconds: number;

            if (remaining > 0) {
                // Time remaining until end
                hours = Math.floor(remaining / (1000 * 60 * 60));
                minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                setIsOvertime(false);
            } else {
                // Time elapsed after end (overtime)
                const overtime = Math.abs(remaining);
                hours = Math.floor(overtime / (1000 * 60 * 60));
                minutes = Math.floor((overtime % (1000 * 60 * 60)) / (1000 * 60));
                seconds = Math.floor((overtime % (1000 * 60)) / 1000);
                setIsOvertime(true);
            }

            const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            setTimer(formattedTime);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [candidate]);

    // Show timer only when test is started and not submitted
    const showTimer = candidate?.startTime && !candidate?.submissionTime;

    return (
        <div className="min-h-screen max-h-screen overflow-hidden">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container flex h-14 md:h-16 items-center justify-between px-3 md:px-4 mx-auto gap-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg md:text-2xl font-bold font-space">
                            CodeReview
                        </h1>
                    </div>
                    
                    {/* Timer in the middle */}
                    {showTimer && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-sm md:text-base font-semibold ${
                            isOvertime 
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500' 
                                : 'bg-muted text-foreground'
                        }`}>
                            <Clock className="h-4 w-4" />
                            <span>{timer}</span>
                        </div>
                    )}
                    
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
