'use client';

import { FormEvent, useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
  };

  return (
    <footer className="bg-black px-5 pb-7 pt-16 text-white sm:px-8 lg:px-12 lg:pt-20">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-12 border-b border-white/20 pb-16 lg:grid-cols-[1.3fr_.8fr_.9fr]">
          <div><a href="#top" className="text-[26px] font-black tracking-[-.09em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-1 text-[8px]">®</sup></a><p className="mt-6 max-w-xs text-[12px] leading-relaxed text-white/55">Join the studio list for first access to future drops and archive releases.</p><form className="mt-7 flex max-w-md border-b border-white" onSubmit={subscribe}><label className="sr-only" htmlFor="newsletter">Email address</label><input id="newsletter" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="YOUR EMAIL ADDRESS" className="w-full bg-transparent py-3 text-[10px] font-bold tracking-[0.12em] outline-none placeholder:text-white/40" /><button className="px-2 text-lg" aria-label="Subscribe">→</button></form>{submitted && <p className="mt-3 text-[10px] text-white/60">YOU ARE ON THE LIST.</p>}</div>
          <div><p className="footer-title">Client service</p><div className="footer-links"><a href="#service">Shipping & Returns</a><a href="#service">Size Guide</a><a href="#service">Track Order</a><a href="#service">Contact</a></div></div>
          <div><p className="footer-title">Follow the studio</p><div className="footer-links"><a href="#top">Instagram</a><a href="#top">TikTok</a><a href="#top">Pinterest</a><a href="#top">Terms & Privacy</a></div></div>
        </div>
        <div className="flex flex-col gap-4 pt-6 text-[9px] font-bold tracking-[0.1em] text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 DRIPNALITY STUDIO</span><span>DESIGNED WITH PURPOSE.</span></div>
      </div>
    </footer>
  );
}
