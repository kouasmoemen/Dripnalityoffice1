'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import { addTshirtToBag, bagCount, isProductSaved, setProductSaved } from '../../lib/commerce-client';
import { supabase } from '../../lib/supabase';
import { tshirtProduct } from '../../lib/tshirt';

export default function TShirtsPage() {
  const [count, setCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const refresh = () => setCount(bagCount());
    const frame = window.requestAnimationFrame(() => {
      refresh();
      setSaved(isProductSaved(tshirtProduct.id));
    });
    window.addEventListener('dripnality:bag-updated', refresh);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('dripnality:bag-updated', refresh);
    };
  }, []);

  const requireAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.assign('/account');
      return null;
    }
    return user;
  };

  const save = async () => {
    const user = await requireAccount();
    if (!user) return;
    const next = !saved;
    setSaved(next);
    setProductSaved(tshirtProduct.id, next);
    const { data: product } = await supabase.from('products').select('id').eq('slug', tshirtProduct.id).maybeSingle();
    if (product) {
      const { error } = next
        ? await supabase.from('wishlist_items').upsert({ user_id: user.id, product_id: product.id }, { onConflict: 'user_id,product_id' })
        : await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', product.id);
      if (error) setNotice('Saved on this device. Cloud sync will retry later.');
    }
    setNotice(next ? 'Saved to your archive.' : 'Removed from your archive.');
  };

  const addToBag = async () => {
    if (!await requireAccount()) return;
    addTshirtToBag('M');
    setCount(bagCount());
    setNotice('Size M added to your bag. Choose another size in product details.');
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-black">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f7f5]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[9px] font-bold tracking-[.14em]"><span className="grid size-6 place-items-center border border-black/20 text-base font-normal">&larr;</span><span className="hidden sm:inline">COLLECTION</span></Link>
          <Link href="/" className="text-[15px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">&reg;</sup></Link>
          <div className="flex items-center gap-3"><Link href="/hoodies" className="text-[9px] font-bold tracking-[.12em]">HOODIES</Link><Link href="/bag" className="text-[9px] font-bold tracking-[.12em]">BAG ({count})</Link></div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
        <div className="flex flex-col justify-between gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-end">
          <div><p className="eyebrow">DROP 02 / AVAILABLE NOW</p><h1 className="mt-4 text-[clamp(3rem,7vw,6.8rem)] font-black leading-[.8] tracking-[-.09em]">T-SHIRTS.</h1></div>
          <p className="max-w-xs text-[12px] leading-relaxed text-black/55">A single oversized piece, presented as the centre of the current release.</p>
        </div>

        <article className="mx-auto mt-12 grid max-w-5xl gap-9 md:grid-cols-[minmax(0,.9fr)_minmax(280px,.7fr)] md:items-center">
          <Link href={`/tshirts/${tshirtProduct.id}`} className="relative mx-auto block aspect-[4/5] w-full max-w-[420px] overflow-hidden bg-[#e9e9e6]">
            <Image src={tshirtProduct.cover} alt={tshirtProduct.name} fill priority sizes="(max-width: 768px) 100vw, 420px" className="object-cover transition duration-700 hover:scale-[1.025]" />
            <span className="absolute left-4 top-4 bg-white px-3 py-2 text-[9px] font-bold tracking-[.14em]">NEW / DRP-TS-003</span>
          </Link>
          <div>
            <p className="eyebrow">THE MAIN RELEASE</p>
            <h2 className="mt-4 text-[clamp(2.1rem,4vw,4rem)] font-black leading-[.85] tracking-[-.08em] uppercase">Oversized<br />Multi-Balaclavas<br />White T-Shirt</h2>
            <p className="mt-5 text-[14px] font-bold">60 TND</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-black/55">A relaxed white silhouette designed for repeat wear. Available in S, M and L.</p>
            <div className="mt-8 grid grid-cols-2 gap-2"><Link href={`/tshirts/${tshirtProduct.id}`} className="bg-black px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-[.14em] text-white">Product details</Link><button onClick={addToBag} className="border border-black/20 px-4 py-3.5 text-[10px] font-bold uppercase tracking-[.14em]">Add to bag</button></div>
            <button onClick={save} aria-pressed={saved} className="mt-4 inline-flex items-center gap-2 border-b border-black/25 pb-1 text-[10px] font-bold uppercase tracking-[.14em] transition hover:border-black">{saved ? '♥ Saved to archive' : '♡ Save to archive'}</button>
            {notice && <p role="status" className="mt-4 border-l-2 border-black pl-3 text-xs text-black/60">{notice}</p>}
          </div>
        </article>
      </section>
      <Footer />
    </main>
  );
}
