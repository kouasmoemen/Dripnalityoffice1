'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { addTshirtToBag } from '../../../lib/commerce-client';
import { supabase } from '../../../lib/supabase';
import { tshirtGallery, tshirtProduct } from '../../../lib/tshirt';

export default function TShirtProductPage() {
  const params = useParams<{ slug: string }>();
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [notice, setNotice] = useState('');
  if (params.slug !== tshirtProduct.id) return <main className="grid min-h-screen place-items-center"><Link href="/tshirts" className="text-sm underline">Back to T-shirts</Link></main>;

  const requireAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.assign('/account'); return null; }
    return user;
  };
  const addToBag = async () => {
    if (!await requireAccount()) return;
    addTshirtToBag(size);
    setNotice(`Size ${size} was added to your bag.`);
  };
  const buyNow = async () => {
    if (!await requireAccount()) return;
    window.location.assign(`/checkout?product=${tshirtProduct.id}&size=${size}`);
  };

  return <main className="min-h-screen bg-[#f8f8f8] text-black"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 bg-[#f8f8f8]/95 px-5 backdrop-blur-md sm:px-8 lg:px-12"><Link href="/tshirts" className="text-[10px] font-bold uppercase tracking-[.16em]">← T-shirts</Link><Link href="/" className="text-[15px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></Link><div className="flex gap-4"><Link href="/bag" className="text-[10px] font-bold uppercase tracking-[.16em]">Bag</Link><Link href="/account" className="text-[10px] font-bold uppercase tracking-[.16em]">Account</Link></div></header><section className="grid lg:grid-cols-[minmax(0,1fr)_minmax(370px,.55fr)]"><div className="h-[calc(100svh-64px)] snap-y snap-mandatory overflow-y-auto bg-[#ecece9]">{tshirtGallery.map((image, index) => <figure key={image} className="relative h-[calc(100svh-64px)] snap-start"><Image src={image} alt={`${tshirtProduct.name} image ${index + 1}`} fill priority={index < 2} sizes="(max-width: 1024px) 100vw, 65vw" className="object-contain sm:object-cover"/><figcaption className="absolute bottom-5 left-5 bg-white/90 px-3 py-2 text-[9px] font-bold tracking-[.15em]">{String(index + 1).padStart(2, '0')} / {String(tshirtGallery.length).padStart(2, '0')}</figcaption></figure>)}</div><aside className="border-l border-black/10 px-5 py-10 sm:px-8 lg:sticky lg:top-16 lg:h-[calc(100svh-64px)] lg:overflow-y-auto lg:px-12 lg:py-14"><p className="eyebrow">DRIPNALITY / DROP 02</p><p className="mt-2 text-[10px] font-bold tracking-[.15em] text-black/45">{tshirtProduct.serial}</p><h1 className="mt-5 text-[clamp(2.5rem,4vw,4.5rem)] font-black leading-[.85] tracking-[-.075em] uppercase">Oversized<br/>Multi-Balaclavas<br/>White T-Shirt</h1><p className="mt-6 text-[14px] font-bold">60 TND</p><p className="mt-7 text-sm leading-6 text-black/58">An oversized white T-shirt defined by the Multi-Balaclavas graphic. Scroll the image rail like a motion archive to view every angle.</p><dl className="mt-8 space-y-3 border-y border-black/10 py-5 text-[10px] font-bold uppercase tracking-[.12em]"><div className="flex justify-between"><dt className="text-black/45">Delivery</dt><dd>8 TND / Tunisia</dd></div><div className="flex justify-between"><dt className="text-black/45">Payment</dt><dd>Cash on delivery</dd></div></dl><div className="mt-8"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.15em]">Select size</p><div className="flex gap-2">{tshirtProduct.sizes.map((option) => <button key={option} onClick={() => setSize(option)} className={`grid size-12 place-items-center border text-[11px] font-bold ${size === option ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black'}`}>{option}</button>)}</div></div><div className="mt-9 grid gap-2"><button onClick={buyNow} className="flex w-full items-center justify-between bg-black px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-white">Buy now / 68 TND <span>↗</span></button><button onClick={addToBag} className="flex w-full items-center justify-between border border-black/20 px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em]">Add to bag <span>+</span></button></div>{notice && <p role="status" className="mt-4 text-xs text-black/55">{notice}</p>}</aside></section></main>;
}
