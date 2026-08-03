'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type UpcomingDrop = { title: string; starts_at: string };

function formatRemaining(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${String(days).padStart(2, '0')}D  ${String(hours).padStart(2, '0')}H  ${String(minutes).padStart(2, '0')}M  ${String(remainingSeconds).padStart(2, '0')}S`;
}

export default function DropCountdown() {
  const [drop, setDrop] = useState<UpcomingDrop | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('drops').select('title,starts_at').eq('status', 'scheduled').eq('is_published', true).not('starts_at', 'is', null).order('starts_at').limit(1);
      const next = data?.[0] as UpcomingDrop | undefined;
      if (!next || new Date(next.starts_at).getTime() <= Date.now()) return;
      setDrop(next);
      setRemaining(new Date(next.starts_at).getTime() - Date.now());
    };
    load();
  }, []);

  useEffect(() => {
    if (!drop) return;
    const timer = window.setInterval(() => {
      const nextRemaining = new Date(drop.starts_at).getTime() - Date.now();
      setRemaining(nextRemaining);
      if (nextRemaining <= 0) { window.clearInterval(timer); setDrop(null); window.location.reload(); }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [drop]);

  if (!drop || remaining <= 0) return null;
  return <section className="fixed inset-0 z-[90] grid place-items-center bg-black px-5 text-center text-white"><div><p className="eyebrow text-white/55">DRIPNALITY / NEXT RELEASE</p><h2 className="mt-6 text-[clamp(3.4rem,10vw,10rem)] font-black leading-[.75] tracking-[-.1em]">{drop.title}</h2><p className="mt-10 font-mono text-[clamp(1.3rem,3vw,3rem)] tracking-[.12em]">{formatRemaining(remaining)}</p><p className="mt-6 text-[10px] font-bold uppercase tracking-[.18em] text-white/55">The studio opens when the timer ends</p></div></section>;
}
