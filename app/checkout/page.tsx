'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBag, saveBag } from '../../lib/commerce-client';
import { supabase } from '../../lib/supabase';
import { tshirtProduct } from '../../lib/tshirt';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const requestedSize = searchParams.get('size');
  const size = requestedSize === 'S' || requestedSize === 'L' ? requestedSize : 'M';

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !session.access_token) { router.replace('/account'); return; }
      setEmail(session.user.email || '');
      setAccessToken(session.access_token);
      setLoadingUser(false);
    };
    loadSession();
  }, [router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    setSubmitting(true); setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        productId: tshirtProduct.id,
        size,
        customer: { email, name: String(form.get('name') || ''), phone: String(form.get('phone') || ''), city: String(form.get('city') || ''), address: String(form.get('address') || '') },
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.message || 'Unable to place your order.'); setSubmitting(false); return; }
    saveBag(getBag().filter((item) => item.productId !== tshirtProduct.id || item.size !== size));
    setOrderReference(data.orderReference || 'DRIPNALITY');
    setSubmitting(false);
  };

  if (loadingUser) return <main className="grid min-h-screen place-items-center bg-[#f8f8f8] text-[10px] font-bold uppercase tracking-[.18em]">Preparing secure order</main>;
  if (orderReference) return <main className="grid min-h-screen place-items-center bg-[#f8f8f8] px-5 text-black"><section className="max-w-lg border-y border-black/10 py-10 text-center"><p className="eyebrow">Order received</p><h1 className="mt-5 text-5xl font-black leading-[.85] tracking-[-.07em]">THANK<br/>YOU.</h1><p className="mt-6 text-sm leading-6 text-black/60">Your cash-on-delivery order was sent securely to DRIPNALITY. We will contact you on the phone number you provided.</p><p className="mt-5 text-[11px] font-bold tracking-[.16em]">{orderReference}</p><Link href="/tshirts" className="mt-8 inline-flex bg-black px-5 py-4 text-[10px] font-bold uppercase tracking-[.15em] text-white">Back to collection</Link></section></main>;

  return <main className="min-h-screen bg-[#f8f8f8] text-black"><header className="flex h-16 items-center justify-between border-b border-black/10 px-5 sm:px-8 lg:px-12"><Link href="/tshirts" className="text-[10px] font-bold uppercase tracking-[.16em]">← Back to product</Link><Link href="/" className="text-[15px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></Link><span className="text-[10px] font-bold uppercase tracking-[.16em]">Secure order</span></header><section className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_.85fr] lg:gap-16 lg:px-12 lg:py-16"><form onSubmit={submit}><p className="eyebrow">Checkout / Tunisia</p><h1 className="mt-4 text-5xl font-black leading-[.85] tracking-[-.07em]">YOUR<br/>DETAILS.</h1><p className="mt-5 text-sm leading-6 text-black/55">Cash on delivery. We ship only across Tunisia. You must be signed in to place an order.</p><div className="mt-9 grid gap-4"><label><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.15em]">Full name</span><input required name="name" maxLength={120} autoComplete="name" className="w-full border border-black/15 bg-transparent px-4 py-3.5 outline-none focus:border-black"/></label><label><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.15em]">Phone number</span><input required name="phone" inputMode="tel" pattern="[0-9+() -]{6,24}" maxLength={24} autoComplete="tel" className="w-full border border-black/15 bg-transparent px-4 py-3.5 outline-none focus:border-black"/></label><label><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.15em]">City in Tunisia</span><input required name="city" maxLength={120} autoComplete="address-level2" className="w-full border border-black/15 bg-transparent px-4 py-3.5 outline-none focus:border-black"/></label><label><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.15em]">Full delivery address</span><textarea required name="address" rows={3} maxLength={500} autoComplete="street-address" className="w-full resize-none border border-black/15 bg-transparent px-4 py-3.5 outline-none focus:border-black"/></label></div><button disabled={submitting} className="mt-8 flex h-11 w-full items-center justify-between border border-black bg-transparent px-4 text-[9px] font-medium uppercase tracking-[.13em] transition hover:bg-black hover:text-white disabled:opacity-60">{submitting ? 'Sending order…' : 'Place cash-on-delivery order'} <span>↗</span></button>{error && <p role="alert" className="mt-4 border-l-2 border-red-700 pl-3 text-sm text-red-800">{error}</p>}</form><aside className="h-fit border-y border-black/10 py-6 lg:sticky lg:top-24"><p className="eyebrow">Order summary</p><h2 className="mt-5 text-2xl font-black leading-[.92] uppercase">Oversized Multi-Balaclavas White T-Shirt</h2><div className="mt-6 space-y-3 border-y border-black/10 py-5 text-sm"><p className="flex justify-between"><span>Product / {tshirtProduct.serial}</span><b>{tshirtProduct.price} TND</b></p><p className="flex justify-between"><span>Size</span><b>{size}</b></p><p className="flex justify-between"><span>Tunisia delivery</span><b>{tshirtProduct.shipping} TND</b></p></div><p className="mt-4 flex justify-between text-lg font-black"><span>Total</span><span>{tshirtProduct.price + tshirtProduct.shipping} TND</span></p><p className="mt-5 text-[11px] leading-relaxed text-black/45">The order includes your product, size, name, phone number and Tunisian delivery address.</p></aside></section></main>;
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f8f8f8] text-[10px] font-bold uppercase tracking-[.18em]">Preparing secure order</main>}><CheckoutContent /></Suspense>;
}
