'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { addTshirtToBag } from '../../../lib/commerce-client';
import { AccountIcon, BagIcon, HeartIcon, SearchIcon } from '../../../components/StoreIcons';
import { supabase } from '../../../lib/supabase';
import { tshirtGallery, tshirtProduct } from '../../../lib/tshirt';

export default function TShirtProductPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [notice, setNotice] = useState('');
  if (params.slug !== tshirtProduct.id) return <main className="grid min-h-screen place-items-center bg-[#f8f8f8]"><Link href="/tshirts" className="text-sm underline underline-offset-4">Back to T-shirts</Link></main>;

  const requireAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/account'); return null; }
    return user;
  };
  const addToBag = async () => {
    if (!await requireAccount()) return;
    addTshirtToBag(size);
    setNotice(`Size ${size} was added to your bag.`);
  };
  const buyNow = async () => {
    if (!await requireAccount()) return;
    router.push(`/checkout?product=${tshirtProduct.id}&size=${size}`);
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-black">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f7f7f5]/95 backdrop-blur-md"><div className="relative mx-auto flex h-16 max-w-[1600px] items-center px-3 sm:px-8 lg:px-12"><nav className="hidden gap-6 md:flex"><Link href="/tshirts" className="text-[9px] font-bold tracking-[.14em]">T-SHIRTS</Link><Link href="/support" className="text-[9px] font-bold tracking-[.14em]">SUPPORT</Link></nav><Link href="/" className="absolute left-1/2 -translate-x-1/2 text-[15px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">&reg;</sup></Link><div className="ml-auto flex items-center gap-1 sm:gap-2"><Link href="/tshirts" className="grid size-8 place-items-center" aria-label="Search collection"><SearchIcon/></Link><Link href="/wishlist" className="grid size-8 place-items-center" aria-label="Saved pieces"><HeartIcon/></Link><Link href="/account" className="grid size-8 place-items-center" aria-label="Account"><AccountIcon/></Link><Link href="/bag" className="flex items-center gap-1 text-[10px] font-bold tracking-[.13em]" aria-label="Shopping bag"><span className="hidden sm:inline">BAG</span><BagIcon/><span>(0)</span></Link></div></div></header>
      <section className="mx-auto max-w-[1560px] px-3 py-3 sm:px-6 sm:py-6 lg:grid lg:grid-cols-[minmax(0,1.22fr)_minmax(340px,.78fr)] lg:gap-10 lg:px-10 lg:py-10">
        <div className="grid gap-3 sm:grid-cols-2">
          {tshirtGallery.map((image, index) => <figure key={image} className="relative aspect-[4/5] overflow-hidden bg-[#e9e9e6]"><Image src={image} alt={`${tshirtProduct.name}, view ${index + 1}`} fill priority={index < 2} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw" className="object-cover" /><figcaption className="absolute bottom-3 left-3 bg-white/90 px-2.5 py-1.5 text-[8px] font-bold tracking-[.14em]">{String(index + 1).padStart(2, '0')} / {String(tshirtGallery.length).padStart(2, '0')}</figcaption></figure>)}
        </div>
        <aside className="px-3 py-10 sm:px-5 lg:sticky lg:top-16 lg:h-fit lg:px-0 lg:py-3">
          <p className="eyebrow">DRIPNALITY / DROP 02</p><div className="mt-3 flex justify-between text-[10px] font-bold tracking-[.14em] text-black/45"><span>{tshirtProduct.serial}</span><span>AVAILABLE</span></div>
          <h1 className="mt-7 text-[clamp(2.8rem,5vw,5.5rem)] font-black leading-[.79] tracking-[-.09em] uppercase">Oversized<br />Multi-Balaclavas<br />White T-Shirt</h1><p className="mt-6 text-[16px] font-bold">59 DNT</p>
          <p className="mt-6 max-w-md text-sm leading-6 text-black/60">A relaxed white T-shirt built around the Multi-Balaclavas graphic. Explore the complete visual sequence, then choose your size.</p>
          <dl className="mt-8 grid grid-cols-2 gap-x-5 gap-y-5 border-y border-black/10 py-5 text-[10px] font-bold uppercase tracking-[.12em]"><div><dt className="text-black/45">Delivery</dt><dd className="mt-1">8 DNT / Tunisia</dd></div><div><dt className="text-black/45">Payment</dt><dd className="mt-1">Cash on delivery</dd></div><div><dt className="text-black/45">Fit</dt><dd className="mt-1">Oversized</dd></div><div><dt className="text-black/45">Release</dt><dd className="mt-1">Drop 02</dd></div></dl>
          <div className="mt-8"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.15em]">Select size</p><div className="flex gap-2">{tshirtProduct.sizes.map((option) => <button key={option} onClick={() => setSize(option)} className={`grid size-12 place-items-center border text-[11px] font-bold transition ${size === option ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black'}`}>{option}</button>)}</div></div>
          <div className="mt-8 grid gap-2"><button onClick={buyNow} className="flex w-full items-center justify-between bg-black px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-white transition hover:bg-black/80">Buy now / 67 DNT <span>&nearr;</span></button><button onClick={addToBag} className="flex w-full items-center justify-between border border-black/25 px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] transition hover:border-black">Add to bag <span>+</span></button></div>
          {notice && <p role="status" className="mt-4 border-l-2 border-black pl-3 text-xs text-black/65">{notice}</p>}<p className="mt-7 text-[10px] leading-relaxed text-black/45">An account is required before placing an order. Your size and delivery information are confirmed at checkout.</p>
        </aside>
      </section>
    </main>
  );
}
