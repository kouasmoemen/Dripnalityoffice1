'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setSubmitted(false);
    setError(false);
    const { data: { user } } = await supabase.auth.getUser();
    const { error: subscribeError } = await supabase.from('subscribers').insert({
      email: email.trim().toLowerCase(),
      user_id: user?.id ?? null,
      source: 'footer',
      early_access: true,
      subscribed_at: new Date().toISOString(),
      unsubscribed_at: null,
    });

    if (subscribeError) {
      if (subscribeError.code === '23505') {
        setSubmitted(true);
        setEmail('');
      } else {
        setError(true);
      }
      return;
    }

    setSubmitted(true);
    setEmail('');
  };

  return (
    <footer className="bg-black px-5 pb-7 pt-16 text-white sm:px-8 lg:px-12 lg:pt-20">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-12 border-b border-white/20 pb-16 lg:grid-cols-[1.3fr_.8fr_.9fr]">
          <div>
            <a href="#top" className="text-[26px] font-black tracking-[-.09em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-1 text-[8px]">®</sup></a>
            <p className="mt-6 max-w-xs text-[12px] leading-relaxed text-white/55">Join the studio list for first access to future drops and archive releases.</p>
            <form className="mt-7 flex max-w-md border-b border-white" onSubmit={subscribe}>
              <label className="sr-only" htmlFor="newsletter">Email address</label>
              <input id="newsletter" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="YOUR EMAIL ADDRESS" className="w-full bg-transparent py-3 text-[10px] font-bold tracking-[0.12em] outline-none placeholder:text-white/40" />
              <button className="px-2 text-lg" aria-label="Subscribe">→</button>
            </form>
            {submitted && <p className="mt-3 text-[10px] text-white/60">YOU ARE ON THE LIST.</p>}
            {error && <p className="mt-3 text-[10px] leading-relaxed text-red-200">Please try again shortly.</p>}
          </div>
          <div><p className="footer-title">Client service</p><div className="footer-links"><Link href="/support">Shipping & Returns</Link><Link href="/support">Size Guide</Link><Link href="/support">Track Order</Link><Link href="/account">My Account</Link></div></div>
          <div><p className="footer-title">Follow the studio</p><div className="footer-links"><a href="https://www.instagram.com/dripnality" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.tiktok.com/@dripnality" target="_blank" rel="noreferrer">TikTok</a><Link href="/tshirts">T-Shirts</Link><Link href="/account">Account & Early Access</Link></div></div>
        </div>
        <div className="flex flex-col gap-4 pt-6 text-[9px] font-bold tracking-[0.1em] text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 DRIPNALITY STUDIO</span><span>DESIGNED WITH PURPOSE.</span></div>
      </div>
    </footer>
  );
}
