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
    const updateBag = () => setCount(bagCount());
    const load = async () => {
      updateBag();
      setSaved(isProductSaved(tshirtProduct.id));
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: product } = await supabase.from('products').select('id').eq('slug', tshirtProduct.id).maybeSingle();
      if (!product) return;
      const { data: item } = await supabase.from('wishlist_items').select('product_id').eq('user_id', user.id).eq('product_id', product.id).maybeSingle();
      if (item) { setSaved(true); setProductSaved(tshirtProduct.id, true); }
    };
    load();
    window.addEventListener('dripnality:bag-updated', updateBag);
    return () => window.removeEventListener('dripnality:bag-updated', updateBag);
  }, []);

  const requireAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.assign('/account'); return null; }
    return user;
  };

  const addToBag = async () => {
    if (!await requireAccount()) return;
    addTshirtToBag('M');
    setCount(bagCount());
    setNotice('Size M was added to your bag. You can select another size in product info.');
  };

  const toggleSaved = async () => {
    const user = await requireAccount();
    if (!user) return;
    const nextSaved = !saved;
    setSaved(nextSaved);
    setProductSaved(tshirtProduct.id, nextSaved);

    const { data: product } = await supabase.from('products').select('id').eq('slug', tshirtProduct.id).maybeSingle();
    if (!product) {
      setNotice(nextSaved ? 'Saved to this device. It will sync when the Drop 02 database record is active.' : 'Removed from your saved pieces.');
      return;
    }
    const { error } = nextSaved
      ? await supabase.from('wishlist_items').upsert({ user_id: user.id, product_id: product.id }, { onConflict: 'user_id,product_id' })
      : await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', product.id);
    setNotice(error ? (nextSaved ? 'Saved locally. Cloud sync is unavailable right now.' : 'Removed locally. Cloud sync is unavailable right now.') : (nextSaved ? 'Saved to wishlist.' : 'Removed from wishlist.'));
  };

  const buyNow = async () => {
    if (!await requireAccount()) return;
    window.location.assign(`/checkout?product=${tshirtProduct.id}&size=M`);
  };

  return <main className="min-h-screen bg-[#f8f8f8] text-black">
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f8f8f8]/95 backdrop-blur-md"><div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-12"><Link href="/" className="inline-flex items-center gap-2 text-[9px] font-bold tracking-[.14em]"><span className="grid size-6 place-items-center border border-black/20 text-base font-normal">←</span><span className="hidden sm:inline">COLLECTION</span></Link><Link href="/" className="text-[15px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></Link><div className="flex items-center gap-3 sm:gap-4"><Link href="/wishlist" className="text-[9px] font-bold tracking-[.12em]">SAVED</Link><Link href="/bag" className="text-[9px] font-bold tracking-[.12em]">BAG ({count})</Link><Link href="/account" className="hidden text-[9px] font-bold tracking-[.12em] sm:block">ACCOUNT</Link></div></div></header>
    <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-8 lg:px-12 lg:py-16"><div className="flex items-end justify-between border-b border-black/10 pb-4"><div><p className="eyebrow">Drop 02 / T-shirts</p><h1 className="mt-3 text-4xl font-black tracking-[-.07em] sm:text-6xl">ONE PIECE.</h1></div><p className="hidden text-[10px] font-bold tracking-[.15em] text-black/45 sm:block">{tshirtProduct.serial}</p></div><article className="mx-auto mt-10 grid max-w-5xl gap-7 sm:grid-cols-[minmax(0,.82fr)_minmax(280px,.6fr)] sm:items-end"><Link href={`/tshirts/${tshirtProduct.id}`} className="relative block aspect-[4/5] max-h-[620px] overflow-hidden bg-[#ecece9]"><Image src={tshirtProduct.cover} alt={tshirtProduct.name} fill priority sizes="(max-width: 640px) 100vw, 54vw" className="object-cover transition duration-700 hover:scale-[1.025]"/><span className="absolute left-4 top-4 bg-white px-3 py-2 text-[9px] font-bold tracking-[.14em]">01 / AVAILABLE</span></Link><div className="pb-1"><p className="eyebrow">{tshirtProduct.serial}</p><h2 className="mt-4 text-[clamp(1.9rem,3.7vw,3.5rem)] font-black leading-[.88] tracking-[-.07em] uppercase">Oversized<br/>Multi-Balaclavas<br/>White T-Shirt</h2><p className="mt-5 text-[13px] font-bold">60 TND</p><p className="mt-2 text-[11px] text-black/50">Tunisia delivery / 8 TND · Cash on delivery</p><div className="mt-7 grid grid-cols-2 gap-2"><button onClick={buyNow} className="bg-black px-4 py-3.5 text-[10px] font-bold uppercase tracking-[.14em] text-white">Buy now ↗</button><Link href={`/tshirts/${tshirtProduct.id}`} className="border border-black/20 px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-[.14em]">Product info</Link></div><div className="mt-2 grid grid-cols-[1fr_auto] gap-2"><button onClick={addToBag} className="border border-black/20 px-4 py-3.5 text-[10px] font-bold uppercase tracking-[.14em] transition hover:border-black">Add to bag</button><button onClick={toggleSaved} aria-label="Save product" className={`grid size-11 place-items-center border text-lg transition ${saved ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black'}`}>{saved ? '♥' : '♡'}</button></div>{notice && <p role="status" className="mt-4 text-xs text-black/55">{notice}</p>}</div></article></section><Footer/>
  </main>;
}
