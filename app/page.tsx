'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type PointerEvent, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function EnterPage() {
  const scene = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    timeline
      .from('[data-enter="top"]', { y: -16, opacity: 0, duration: 0.7 })
      .from('[data-enter="label"]', { y: 18, opacity: 0, duration: 0.55 }, '-=0.25')
      .from('[data-enter="title"]', { yPercent: 20, opacity: 0, duration: 1.05, stagger: 0.1 }, '-=0.18')
      .from('[data-enter="copy"]', { y: 20, opacity: 0, duration: 0.65, stagger: 0.1 }, '-=0.55');
    gsap.fromTo('[data-enter="image"]', { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'power2.out' });
    gsap.to('[data-enter="marker"]', { y: 8, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }, { scope: scene });

  const moveScene = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    event.currentTarget.style.setProperty('--pointer-x', x.toFixed(3));
    event.currentTarget.style.setProperty('--pointer-y', y.toFixed(3));
  };

  return (
    <main ref={scene} onPointerMove={moveScene} onPointerLeave={(event) => { event.currentTarget.style.setProperty('--pointer-x', '0'); event.currentTarget.style.setProperty('--pointer-y', '0'); }} className="enter-page min-h-[100svh] overflow-hidden bg-[#070707] text-white">
      <section className="relative isolate flex min-h-[100svh] overflow-hidden">
        <div data-enter="image" className="absolute inset-0 origin-center overflow-hidden">
          <div className="enter-page__image absolute -inset-8">
            <Image src="/tshirt-drop/T12.jpeg" alt="DRIPNALITY Drop 02 editorial" fill priority sizes="100vw" className="object-cover grayscale contrast-125" />
          </div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.97)_0%,rgba(0,0,0,.86)_31%,rgba(0,0,0,.35)_66%,rgba(0,0,0,.52)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,transparent_0%,rgba(0,0,0,.24)_43%,rgba(0,0,0,.78)_100%)]" />
        <div className="enter-page__grid absolute inset-0 opacity-40" />
        <div className="absolute inset-x-0 top-16 h-px bg-white/15" />

        <header data-enter="top" className="absolute inset-x-0 top-0 z-20"><div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 lg:px-12"><Link href="/developers" className="w-fit text-[9px] font-bold uppercase tracking-[.18em] text-white/65 transition hover:text-white">Built by Depthx</Link><Link href="/" aria-label="DRIPNALITY home" className="text-[17px] font-black tracking-[-.09em] sm:text-[20px]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[7px]">&reg;</sup></Link><Link href="/account" className="ml-auto w-fit text-[9px] font-bold uppercase tracking-[.18em] text-white/65 transition hover:text-white">Member access</Link></div></header>

        <aside className="absolute bottom-10 left-5 z-10 hidden items-end gap-4 lg:flex lg:left-12 lg:bottom-14"><span className="origin-bottom-left -rotate-90 text-[8px] font-bold tracking-[.32em] text-white/50">DRIPNALITY / ISSUE 02</span><span className="h-16 w-px bg-white/35" /></aside>
        <div className="absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 items-center gap-3 lg:flex lg:right-12"><span className="h-px w-12 bg-white/45" /><span className="text-[8px] font-bold tracking-[.24em] text-white/60">TUNISIA / 36.8065&deg; N</span></div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col justify-end px-5 pb-10 pt-24 sm:px-8 sm:pb-14 lg:px-12 lg:pb-16">
          <div className="max-w-[920px]">
            <p data-enter="label" className="text-[9px] font-bold tracking-[.34em] text-white/65">DROP 02 / THE CURRENT FORM</p>
            <div className="mt-5 overflow-hidden"><h1 data-enter="title" className="text-[clamp(4.75rem,13vw,14.5rem)] font-black leading-[.68] tracking-[-.125em]">DRIP</h1></div>
            <div className="overflow-hidden"><h1 data-enter="title" className="ml-[.01em] font-serif text-[clamp(4.7rem,13vw,14.5rem)] font-normal italic leading-[.71] tracking-[-.16em]">NALITY.</h1></div>
          </div>

          <div className="mt-8 grid gap-8 border-t border-white/20 pt-5 sm:mt-10 sm:grid-cols-[minmax(0,300px)_1fr] sm:items-end lg:grid-cols-[minmax(0,360px)_1fr_minmax(230px,320px)]">
            <p data-enter="copy" className="max-w-[340px] text-[12px] leading-relaxed text-white/65">Designed with purpose. A limited streetwear release engineered in Tunisia for the way the city moves.</p>
            <div data-enter="copy" className="hidden justify-self-center text-center lg:block"><p className="text-[8px] font-bold tracking-[.25em] text-white/50">THE OBJECT / THE ATTITUDE / THE MOMENT</p></div>
            <div data-enter="copy" className="flex flex-col items-start gap-4 sm:items-end">
              <Link href="/tshirts" className="group flex min-w-[240px] items-center justify-between bg-white px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-black transition duration-300 hover:bg-white/85 sm:min-w-[270px]">Enter the release <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span></Link>
              <Link href="/hoodies" className="group flex items-center gap-4 border-b border-white/55 pb-2 text-[10px] font-bold uppercase tracking-[.15em] text-white/85 transition hover:text-white">Explore archive <span className="transition-transform duration-300 group-hover:translate-x-1">→</span></Link>
            </div>
          </div>
        </div>

        <div data-enter="marker" className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-6"><span className="text-[8px] font-bold tracking-[.23em] text-white/50">ENTER</span><span className="h-7 w-px bg-white/60" /></div>
      </section>
      <style jsx>{`
        .enter-page { --pointer-x: 0; --pointer-y: 0; }
        .enter-page__image { transform: translate3d(calc(var(--pointer-x) * -12px), calc(var(--pointer-y) * -9px), 0); transition: transform 900ms cubic-bezier(.2,.7,.2,1); }
        .enter-page__grid { background-image: linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px); background-size: 58px 58px; mask-image: linear-gradient(90deg, black, rgba(0,0,0,.28)); }
        @media (prefers-reduced-motion: reduce) { .enter-page__image { transform: none; transition: none; } }
      `}</style>
    </main>
  );
}
