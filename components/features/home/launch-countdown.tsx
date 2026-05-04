'use client';

import { useEffect, useMemo, useState } from 'react';

type LaunchCountdownProps = {
  launchDate?: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(targetDate: Date): TimeLeft | null {
  const diff = targetDate.getTime() - Date.now();

  if (diff <= 0) {
    return null;
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const labels = [
  { key: 'days', label: 'jours' },
  { key: 'hours', label: 'heures' },
  { key: 'minutes', label: 'minutes' },
  { key: 'seconds', label: 'secondes' },
] as const;

export function LaunchCountdown({ launchDate }: LaunchCountdownProps) {
  const targetDate = useMemo(() => {
    if (!launchDate) {
      return null;
    }

    const date = new Date(launchDate);

    return Number.isNaN(date.getTime()) ? null : date;
  }, [launchDate]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    targetDate ? getTimeLeft(targetDate) : null,
  );

  useEffect(() => {
    if (!targetDate) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  if (!targetDate || !timeLeft) {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-4 text-center shadow-inner">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-foreground/55">
          Lancement
        </p>
        <p className="mt-2 text-2xl font-black text-primary-foreground">
          Prochainement
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {labels.map((item) => (
        <div
          key={item.key}
          className="rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-4 text-center shadow-inner"
        >
          <p className="font-mono text-3xl font-black text-accent">
            {String(timeLeft[item.key]).padStart(2, '0')}
          </p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-primary-foreground/55">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
