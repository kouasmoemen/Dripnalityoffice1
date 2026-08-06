'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

const menuItems = [
  { number: '01', label: 'Shop all', href: '/tshirts' },
  { number: '02', label: 'Support', href: '/support' },
  { number: '03', label: 'Archive', href: '/hoodies' },
];

const ease = [0.22, 1, 0.36, 1] as const;

function formatLocalTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
  }).format(date);
}

function formatLocalDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(date);
}

export default function EnterPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [isLeaving, setIsLeaving] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  function leaveFor(href: string) {
    if (isLeaving) return;
    setIsLeaving(true);
    window.setTimeout(() => router.push(href), shouldReduceMotion ? 0 : 380);
  }

  const reveal = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden bg-black px-5 py-8 font-sans text-white selection:bg-white selection:text-black sm:px-8">
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/vid2.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-black/35" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.6)_0%,rgba(0,0,0,.14)_38%,rgba(0,0,0,.58)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_48%,transparent_0%,rgba(0,0,0,.35)_100%)]" />
      <motion.section
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { delayChildren: shouldReduceMotion ? 0 : 0.12, staggerChildren: shouldReduceMotion ? 0 : 0.1 } } }}
        className="relative z-10 flex w-full flex-col items-center justify-center text-center"
      >
        <motion.p variants={reveal} transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease }} className="text-[9px] font-medium uppercase tracking-[.32em] text-white/75 sm:text-[10px] sm:tracking-[.42em]">
          {now ? formatLocalDate(now) : 'Loading local time'}
        </motion.p>
        <motion.time variants={reveal} transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease }} className="mt-2 font-mono text-[clamp(1rem,2.3vw,1.65rem)] font-medium tracking-[.08em] text-white">
          {now ? formatLocalTime(now) : '--:--:-- --'}
        </motion.time>

        <motion.h1 variants={reveal} transition={{ duration: shouldReduceMotion ? 0 : 0.85, ease }} className="mt-7 whitespace-nowrap text-[clamp(3.1rem,12.6vw,13rem)] font-black leading-[.71] tracking-[-.12em] drop-shadow-[0_4px_22px_rgba(0,0,0,.34)] sm:mt-9">
          DRIPNALITY<span className="ml-[.05em] align-top text-[.16em] font-medium tracking-normal">®</span>
        </motion.h1>

        <motion.nav variants={reveal} transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease }} aria-label="Dripnality destinations" className="mt-9 w-full max-w-[300px] sm:mt-11 sm:max-w-[370px]">
          <ul className="space-y-2.5 sm:space-y-3">
            {menuItems.map((item) => (
              <li key={item.href}>
                <motion.button
                  type="button"
                  onClick={() => leaveFor(item.href)}
                  disabled={isLeaving}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex h-12 w-full items-center border border-white/75 bg-black/20 px-4 text-left backdrop-blur-[3px] transition hover:border-white hover:bg-white hover:text-black disabled:pointer-events-none sm:h-[54px] sm:px-5"
                >
                  <span className="text-[8px] font-medium tracking-[.18em] text-white/65 transition-colors group-hover:text-black/55">[{item.number}]</span>
                  <span className="mx-auto text-[10px] font-bold uppercase tracking-[.28em] sm:text-[11px]">{item.label}</span>
                  <span className="text-base font-light transition-transform group-hover:translate-x-1">↗</span>
                </motion.button>
              </li>
            ))}
          </ul>
        </motion.nav>
      </motion.section>

      <motion.div
        initial={false}
        animate={{ opacity: isLeaving ? 1 : 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.34, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-0 z-20 bg-black"
      />
    </main>
  );
}
