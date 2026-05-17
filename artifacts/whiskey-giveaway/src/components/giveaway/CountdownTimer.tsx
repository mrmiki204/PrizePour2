import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  daysToAdd: number;
}

export function CountdownTimer({ daysToAdd }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToAdd);

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [daysToAdd]);

  return (
    <div className="flex items-center gap-3 font-serif text-sm tracking-wider">
      <div className="flex flex-col items-center">
        <span className="text-primary font-bold text-lg">{timeLeft.days.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase text-muted-foreground">Days</span>
      </div>
      <span className="text-primary/50 text-lg mb-4">:</span>
      <div className="flex flex-col items-center">
        <span className="text-primary font-bold text-lg">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase text-muted-foreground">Hrs</span>
      </div>
      <span className="text-primary/50 text-lg mb-4">:</span>
      <div className="flex flex-col items-center">
        <span className="text-primary font-bold text-lg">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase text-muted-foreground">Min</span>
      </div>
      <span className="text-primary/50 text-lg mb-4">:</span>
      <div className="flex flex-col items-center">
        <span className="text-primary font-bold text-lg">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        <span className="text-[10px] uppercase text-muted-foreground">Sec</span>
      </div>
    </div>
  );
}
