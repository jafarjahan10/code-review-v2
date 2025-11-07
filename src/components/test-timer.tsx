'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TestTimerProps {
    startTime: string | Date;
    submissionTime?: string | Date | null;
}

export function TestTimer({ startTime, submissionTime }: TestTimerProps) {
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    useEffect(() => {
        const calculateElapsedTime = () => {
            const start = new Date(startTime).getTime();
            const end = submissionTime ? new Date(submissionTime).getTime() : new Date().getTime();
            const diff = end - start;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            setElapsedTime(formattedTime);
        };

        // Calculate immediately
        calculateElapsedTime();

        // If submitted, don't update (show final time)
        if (submissionTime) {
            return;
        }

        // Update every second only if not submitted
        const interval = setInterval(calculateElapsedTime, 1000);

        return () => clearInterval(interval);
    }, [startTime, submissionTime]);

    return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted/50">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono font-medium tabular-nums">
                {elapsedTime}
            </span>
        </div>
    );
}
