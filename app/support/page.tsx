'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabase';

const faqs = [
  ['Where is my order?', 'When a drop ships, we send a confirmation email with tracking information. Limited releases may need up to three business days for final quality control.'],
  ['Do you ship worldwide?', 'Yes. DRIPNALITY ships internationally. Available delivery options and final costs are shown at checkout for your destination.'],
  ['What is your returns policy?', 'Unworn items in their original condition may be requested for return within 14 days of delivery. Archive and final-sale pieces are not eligible for return.'],
  ['How do I get early access?', 'Create a DRIPNALITY account and join the mailing list. Confirmed members are notified before a new drop goes live.'],
];

export default function SupportPage() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');

  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setSent(false);
    setFormError('');

    const form = new FormData(event.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('support_inquiries').insert({
      user_id: user?.id ?? null,
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      subject: String(form.get('subject') ?? 'General enquiry'),
      message: String(form.get('message') ?? ''),
    });

    if (error) {
      setFormError('Your message could not be sent yet. Please email support@dripnality.com.');
    } else {
      setSent(true);
      event.currentTarget.reset();
    }
    setSending(false);
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[9px] font-bold tracking-[0.14em]"><span className="grid size-6 place-items-center border border-black/20 text-base font-normal">←</span> BACK TO STORE</Link>
          <Link href="/" className="text-[15px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></Link>
          <Link href="/account" className="text-[9px] font-bold tracking-[0.12em]">MY ACCOUNT</Link>
        </div>
      </header>

      <section className="border-b border-black/10 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <p className="eyebrow">Client services</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(3.8rem,9vw,9.5rem)] font-black leading-[.78] tracking-[-.1em]">WE ARE<br /><span className="font-serif font-normal italic tracking-[-.12em]">here.</span></h1>
          <p className="mt-8 max-w-sm text-[13px] leading-relaxed text-black/60">Answers, order help and direct studio support—without the runaround.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-12 lg:py-28">
        <div>
          <p className="eyebrow mb-8">Frequently asked</p>
          <div className="border-t border-black/15">
            {faqs.map(([question, answer], index) => (
              <article key={question} className="border-b border-black/15">
                <button className="flex w-full items-center justify-between gap-5 py-6 text-left" onClick={() => setActiveFaq(activeFaq === index ? -1 : index)} aria-expanded={activeFaq === index}>
                  <span className="text-[12px] font-bold uppercase tracking-[0.04em]">{question}</span><span className="text-xl font-light">{activeFaq === index ? '−' : '+'}</span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ${activeFaq === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <p className="overflow-hidden pb-5 pr-8 text-[12px] leading-relaxed text-black/60">{answer}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="bg-black p-6 text-white sm:p-9 lg:p-12">
          <p className="eyebrow text-white/55">Direct inquiry</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-.06em]">Tell us what you need.</h2>
          <form className="mt-10 space-y-6" onSubmit={submitInquiry}>
            <label className="block"><span className="mb-2 block text-[9px] font-bold tracking-[.14em]">NAME</span><input required name="name" className="w-full border-b border-white/35 bg-transparent py-2 text-sm outline-none placeholder:text-white/35 focus:border-white" placeholder="Your name" /></label>
            <label className="block"><span className="mb-2 block text-[9px] font-bold tracking-[.14em]">EMAIL</span><input required type="email" name="email" className="w-full border-b border-white/35 bg-transparent py-2 text-sm outline-none placeholder:text-white/35 focus:border-white" placeholder="you@email.com" /></label>
            <label className="block"><span className="mb-2 block text-[9px] font-bold tracking-[.14em]">SUBJECT</span><input required name="subject" className="w-full border-b border-white/35 bg-transparent py-2 text-sm outline-none placeholder:text-white/35 focus:border-white" placeholder="Order, sizing, shipping…" /></label>
            <label className="block"><span className="mb-2 block text-[9px] font-bold tracking-[.14em]">MESSAGE</span><textarea required name="message" rows={4} className="w-full resize-none border-b border-white/35 bg-transparent py-2 text-sm outline-none placeholder:text-white/35 focus:border-white" placeholder="How can we help?" /></label>
            <button disabled={sending} className="mt-2 w-full bg-white px-5 py-3 text-[9px] font-bold tracking-[.14em] text-black disabled:opacity-60">{sending ? 'SENDING…' : 'SEND INQUIRY →'}</button>
            {sent && <p className="text-[10px] font-bold tracking-[.1em] text-white/70">YOUR MESSAGE HAS BEEN RECEIVED.</p>}
            {formError && <p className="text-[10px] leading-relaxed tracking-[.06em] text-red-200">{formError}</p>}
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] border-t border-black/10 md:grid-cols-3">
        <div className="border-b border-black/10 p-8 md:border-b-0 md:border-r lg:p-12"><p className="eyebrow">01</p><h3 className="mt-14 text-[12px] font-bold uppercase">Worldwide delivery</h3><p className="mt-3 text-[11px] leading-relaxed text-black/60">Tracked delivery from our studio to your door.</p></div>
        <div className="border-b border-black/10 p-8 md:border-b-0 md:border-r lg:p-12"><p className="eyebrow">02</p><h3 className="mt-14 text-[12px] font-bold uppercase">Drop access</h3><p className="mt-3 text-[11px] leading-relaxed text-black/60">Create an account for release updates and member access.</p></div>
        <div className="p-8 lg:p-12"><p className="eyebrow">03</p><h3 className="mt-14 text-[12px] font-bold uppercase">Studio contact</h3><a className="mt-3 block text-[11px] underline underline-offset-4" href="mailto:support@dripnality.com">support@dripnality.com</a></div>
      </section>
      <Footer />
    </main>
  );
}
