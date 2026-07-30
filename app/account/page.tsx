'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabase';

type AuthMode = 'sign-in' | 'sign-up';

type Profile = {
  full_name: string | null;
  early_access: boolean | null;
};

export default function AccountPage() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async (currentUser: User | null) => {
      setUser(currentUser);
      setProfile(null);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('full_name, early_access')
        .eq('id', currentUser.id)
        .maybeSingle();

      setProfile(data);
      setLoading(false);
    };

    supabase.auth.getUser().then(({ data }) => loadProfile(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice('');
    setError('');

    if (mode === 'sign-up') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/account`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user?.identities?.length === 0) {
        setNotice('This email already has an account. Please sign in instead.');
      } else {
        setNotice('Check your email to confirm your account and unlock early access.');
        setPassword('');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      }
    }

    setSubmitting(false);
  };

  const continueWithGoogle = async () => {
    setSubmitting(true);
    setNotice('');
    setError('');

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/account` },
    });

    if (googleError) {
      setError(googleError.message);
      setSubmitting(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setNotice('You have been signed out.');
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-black">
      <header className="flex min-h-[72px] items-center justify-between border-b border-black/10 bg-[#f7f7f5] px-5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="grid size-7 place-items-center rounded-full border border-black/20 text-base transition group-hover:bg-black group-hover:text-white">←</span>
          Back to collection
        </Link>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-display text-xl font-black tracking-[-0.08em] sm:text-2xl">
          DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[7px] tracking-normal">®</sup>
        </Link>
        <Link href="/support" className="hidden text-[10px] font-bold uppercase tracking-[0.2em] sm:block">Support</Link>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-stretch lg:grid-cols-[0.94fr_1.06fr]">
        <div className="relative hidden overflow-hidden bg-black px-10 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="relative">
            <p className="eyebrow text-white/55">Members / early access</p>
            <h1 className="mt-8 max-w-md text-6xl font-black leading-[0.85] tracking-[-0.08em] xl:text-7xl">MORE THAN<br />A DROP.</h1>
          </div>
          <div className="relative max-w-sm">
            <p className="font-serif text-4xl italic leading-none">A place in the first row.</p>
            <p className="mt-6 text-sm leading-6 text-white/60">Create your account to save pieces, follow future releases and receive private drop access by email.</p>
          </div>
        </div>

        <div className="flex items-center px-5 py-14 sm:px-10 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            {loading ? (
              <div className="py-20 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Loading account</div>
            ) : user ? (
              <div>
                <p className="eyebrow">Your account</p>
                <h1 className="mt-4 text-5xl font-black leading-[0.88] tracking-[-0.07em] sm:text-6xl">WELCOME<br />BACK.</h1>
                <div className="mt-10 border-y border-black/10 py-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">Member</p>
                  <p className="mt-2 text-xl font-semibold">{profile?.full_name || user.user_metadata.full_name || 'DRIPNALITY Member'}</p>
                  <p className="mt-1 text-sm text-black/55">{user.email}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-b border-black/10 pb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Drop access</p>
                    <p className="mt-1 text-sm text-black/55">Release notices and early access.</p>
                  </div>
                  <span className="rounded-full bg-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                    {profile?.early_access === false ? 'Member' : 'Early access'}
                  </span>
                </div>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Link href="/#collection" className="button-light bg-black text-white hover:bg-black/75">View archive <span>↗</span></Link>
                  <button onClick={signOut} className="border border-black/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition hover:border-black">Sign out</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="eyebrow">Private access / 01</p>
                <h1 className="mt-4 text-5xl font-black leading-[0.88] tracking-[-0.07em] sm:text-6xl">
                  {mode === 'sign-in' ? <>SIGN<br />IN.</> : <>CREATE<br />ACCOUNT.</>}
                </h1>
                <p className="mt-6 max-w-sm text-sm leading-6 text-black/55">{mode === 'sign-in' ? 'Access your saved pieces and the next DRIPNALITY release.' : 'Be first to know when the next release becomes available.'}</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  {mode === 'sign-up' && (
                    <label className="block">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em]">Name</span>
                      <input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="w-full border border-black/15 bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-black" placeholder="Your name" />
                    </label>
                  )}
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em]">Email</span>
                    <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="w-full border border-black/15 bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-black" placeholder="you@email.com" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em]">Password</span>
                    <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} className="w-full border border-black/15 bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-black" placeholder="At least 6 characters" />
                  </label>
                  {error && <p role="alert" className="border-l-2 border-red-700 pl-3 text-sm text-red-800">{error}</p>}
                  {notice && <p role="status" className="border-l-2 border-black pl-3 text-sm text-black/65">{notice}</p>}
                  <button disabled={submitting} className="flex w-full items-center justify-between bg-black px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-black/75 disabled:cursor-wait disabled:opacity-60">
                    {submitting ? 'Please wait' : mode === 'sign-in' ? 'Sign in' : 'Create account'} <span>↗</span>
                  </button>
                </form>

                <div className="my-5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.14em] text-black/35"><span className="h-px flex-1 bg-black/10" />or<span className="h-px flex-1 bg-black/10" /></div>
                <button onClick={continueWithGoogle} disabled={submitting} className="flex w-full items-center justify-center gap-3 border border-black/15 px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] transition hover:border-black disabled:opacity-60">
                  <span className="text-sm normal-case">G</span> Continue with Google
                </button>
                <p className="mt-7 text-center text-[11px] text-black/50">
                  {mode === 'sign-in' ? 'New to DRIPNALITY?' : 'Already have an account?'}{' '}
                  <button onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); setNotice(''); }} className="font-bold text-black underline underline-offset-4">
                    {mode === 'sign-in' ? 'Create an account' : 'Sign in'}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
