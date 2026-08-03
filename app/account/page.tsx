'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabase';

type Profile = { full_name: string | null; early_access: boolean | null; role: string | null };

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://dripnality.com';

const maskEmail = (email?: string | null) => {
  if (!email) return 'Private email';
  const [localPart, domain] = email.split('@');
  if (!domain) return 'Private email';
  const visibleLocal = localPart.slice(0, 2);
  return `${visibleLocal}••••••@${domain}`;
};

function GoogleMark() {
  return <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true"><path fill="#4285F4" d="M21.8 12.23c0-.71-.06-1.39-.19-2.05H12v3.88h5.49a4.7 4.7 0 0 1-2.04 3.08v2.51h3.31c1.94-1.78 3.04-4.4 3.04-7.42Z"/><path fill="#34A853" d="M12 22c2.75 0 5.05-.91 6.76-2.47l-3.31-2.51c-.91.61-2.08.97-3.45.97-2.66 0-4.92-1.8-5.73-4.21H2.86v2.59A10.2 10.2 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.27 13.78A6.1 6.1 0 0 1 5.95 12c0-.62.11-1.22.32-1.78V7.63H2.86A10.08 10.08 0 0 0 1.8 12c0 1.57.38 3.05 1.06 4.37l3.41-2.59Z"/><path fill="#EA4335" d="M12 6.01c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.04 2.97 14.75 2 12 2a10.2 10.2 0 0 0-9.14 5.63l3.41 2.59C7.08 7.81 9.34 6.01 12 6.01Z"/></svg>;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAccount = async (currentUser: User | null) => {
      setUser(currentUser);
      setProfile(null);
      if (!currentUser) { setLoading(false); return; }
      const { data } = await supabase.from('profiles').select('full_name, early_access, role').eq('id', currentUser.id).maybeSingle();
      setProfile(data);
      setLoading(false);
    };
    supabase.auth.getUser().then(({ data }) => loadAccount(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setLoading(true); loadAccount(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setSigningIn(true);
    setError('');
    const redirectTo = `${siteOrigin.replace(/\/$/, '')}/account`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (authError) { setError(authError.message); setSigningIn(false); }
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  return <main className="min-h-screen bg-[#f7f7f5] text-black">
    <header className="flex min-h-[72px] items-center justify-between border-b border-black/10 bg-[#f7f7f5] px-5 sm:px-8 lg:px-12">
      <Link href="/" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em]"><span className="grid size-7 place-items-center rounded-full border border-black/20 text-base transition group-hover:bg-black group-hover:text-white">←</span>Back to collection</Link>
      <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-display text-xl font-black tracking-[-0.08em] sm:text-2xl">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[7px] tracking-normal">®</sup></Link>
      <Link href="/support" className="hidden text-[10px] font-bold uppercase tracking-[0.2em] sm:block">Support</Link>
    </header>
    <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-stretch lg:grid-cols-[0.94fr_1.06fr]">
      <aside className="relative hidden overflow-hidden bg-black px-10 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-16"><div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px]"/><div className="relative"><p className="eyebrow text-white/55">Members / early access</p><h1 className="mt-8 max-w-md text-6xl font-black leading-[0.85] tracking-[-0.08em] xl:text-7xl">MORE THAN<br/>A DROP.</h1></div><div className="relative max-w-sm"><p className="font-serif text-4xl italic leading-none">A place in the first row.</p><p className="mt-6 text-sm leading-6 text-white/60">Google sign-in keeps your saved pieces, order history and early access in one place.</p></div></aside>
      <div className="flex items-center px-5 py-14 sm:px-10 lg:px-16 xl:px-24"><div className="mx-auto w-full max-w-md">
        {loading ? <div className="py-20 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Loading account</div> : user ? <div><p className="eyebrow">Your account</p><h1 className="mt-4 text-5xl font-black leading-[0.88] tracking-[-0.07em] sm:text-6xl">WELCOME<br/>BACK.</h1><div className="mt-10 border-y border-black/10 py-6"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">Member</p><p className="mt-2 text-xl font-semibold">{profile?.full_name || user.user_metadata.full_name || 'DRIPNALITY Member'}</p><p className="mt-1 text-sm text-black/55">{maskEmail(user.email)}</p></div><div className="mt-6 flex items-center justify-between border-b border-black/10 pb-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em]">Drop access</p><p className="mt-1 text-sm text-black/55">Release notices and early access.</p></div><span className="rounded-full bg-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white">{profile?.early_access === false ? 'Member' : 'Early access'}</span></div><div className="mt-10 flex flex-wrap gap-3"><Link href="/wishlist" className="button-light bg-black text-white hover:bg-black/75">Saved pieces <span>↗</span></Link>{profile?.role === 'admin' && <Link href="/admin" className="border border-black/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em]">Admin</Link>}<button onClick={signOut} className="border border-black/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition hover:border-black">Sign out</button></div></div> : <div><p className="eyebrow">Members / private access</p><h1 className="mt-4 text-5xl font-black leading-[0.88] tracking-[-0.07em] sm:text-6xl">YOUR<br/>ACCESS.</h1><p className="mt-6 max-w-sm text-sm leading-6 text-black/55">Create your account or sign in securely with your Google account.</p><button onClick={signInWithGoogle} disabled={signingIn} className="mt-10 flex w-full items-center justify-center gap-3 border border-black/20 bg-white px-5 py-4 text-[11px] font-bold tracking-[0.04em] transition hover:border-black hover:bg-black/[.03] disabled:cursor-wait disabled:opacity-60"><GoogleMark/>{signingIn ? 'Opening Google…' : 'Continue with Google'}</button>{error && <p role="alert" className="mt-5 border-l-2 border-red-700 pl-3 text-sm text-red-800">{error}</p>}<p className="mt-7 text-[11px] leading-relaxed text-black/45">By continuing, you create or access your DRIPNALITY account. We never see or store your Google password.</p></div>}
      </div></div>
    </section>
    <Footer/>
  </main>;
}
