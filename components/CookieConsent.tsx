'use client';

import { useEffect, useState } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(localStorage.getItem('dripnality_cookie_choice') === null));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const choose = (choice: 'essential' | 'all') => {
    localStorage.setItem('dripnality_cookie_choice', choice);
    setVisible(false);
  };
  if (!visible) return null;
  return <aside className="fixed bottom-4 left-4 right-4 z-[100] mx-auto flex max-w-xl flex-col gap-4 border border-white/15 bg-black px-5 py-5 text-white shadow-2xl sm:flex-row sm:items-center sm:justify-between" role="dialog" aria-label="Cookie preferences"><p className="text-[11px] leading-relaxed text-white/70">We use essential cookies for your account, bag and secure checkout. You choose whether to allow optional experience cookies.</p><div className="flex shrink-0 gap-2"><button onClick={() => choose('essential')} className="border border-white/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[.13em]">Essential only</button><button onClick={() => choose('all')} className="bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-[.13em] text-black">Accept all</button></div></aside>;
}
