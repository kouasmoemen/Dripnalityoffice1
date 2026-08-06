'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { addTshirtToBag, BagItem, getBag, saveBag } from '../../lib/commerce-client';
import { supabase } from '../../lib/supabase';
import { tshirtProduct } from '../../lib/tshirt';

export default function BagPage() {
  const router = useRouter();
  const [items, setItems] = useState<BagItem[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = () => setItems(getBag());

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/account');
        return;
      }
      refresh();
      setReady(true);
    };
    load();
    window.addEventListener('dripnality:bag-updated', refresh);
    return () => window.removeEventListener('dripnality:bag-updated', refresh);
  }, [router]);

  const updateQuantity = (item: BagItem, nextQuantity: number) => {
    const next = items.flatMap((current) => current.productId === item.productId && current.size === item.size
      ? nextQuantity > 0 ? [{ ...current, quantity: Math.min(10, nextQuantity) }] : []
      : [current]);
    saveBag(next);
    setItems(next);
  };

  const subtotal = items.reduce((total, item) => total + tshirtProduct.price * item.quantity, 0);
  const shipping = items.length ? tshirtProduct.shipping : 0;

  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#f8f8f8] text-[10px] font-bold uppercase tracking-[.18em]">Loading bag</main>;

  return <main className="min-h-screen bg-[#f8f8f8] text-black">
    <header className="flex h-16 items-center justify-between border-b border-black/10 px-5 sm:px-8 lg:px-12"><Link href="/tshirts" className="text-[10px] font-bold uppercase tracking-[.15em]">← T-shirts</Link><Link href="/" className="text-[15px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></Link><Link href="/account" className="text-[10px] font-bold uppercase tracking-[.15em]">Account</Link></header>
    <section className="mx-auto grid max-w-5xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_320px] lg:px-12 lg:py-16">
      <div><p className="eyebrow">Private bag</p><h1 className="mt-4 text-5xl font-black leading-[.85] tracking-[-.07em] sm:text-6xl">YOUR<br/>BAG.</h1>{items.length ? <div className="mt-10 divide-y divide-black/10 border-y border-black/10">{items.map((item) => <article key={`${item.productId}-${item.size}`} className="grid grid-cols-[105px_1fr] gap-5 py-5 sm:grid-cols-[130px_1fr]"><div className="relative aspect-[4/5] overflow-hidden bg-[#ecece9]"><Image src={tshirtProduct.cover} alt={tshirtProduct.name} fill sizes="130px" className="object-cover"/></div><div><button onClick={() => updateQuantity(item, 0)} className="float-right text-[10px] font-bold tracking-[.12em] text-black/50 underline underline-offset-4">REMOVE</button><p className="text-[10px] font-bold tracking-[.13em] text-black/45">{tshirtProduct.serial}</p><h2 className="mt-2 max-w-sm text-sm font-bold uppercase leading-snug">{tshirtProduct.name}</h2><p className="mt-3 text-xs">Size <b>{item.size}</b> · {tshirtProduct.price} TND</p><div className="mt-5 flex w-28 items-center justify-between border border-black/15"><button aria-label="Decrease quantity" className="size-9" onClick={() => updateQuantity(item, item.quantity - 1)}>−</button><span className="text-xs font-bold">{item.quantity}</span><button aria-label="Increase quantity" className="size-9" onClick={() => { addTshirtToBag(item.size); refresh(); }}>+</button></div></div></article>)}</div> : <div className="mt-10 border-y border-black/10 py-10"><p className="text-sm leading-6 text-black/55">Your bag is empty.</p><Link href="/tshirts" className="mt-5 inline-flex bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-white">Explore T-shirts</Link></div>}</div>
      <aside className="h-fit border-y border-black/10 py-6 lg:sticky lg:top-24"><p className="eyebrow">Order summary</p><div className="mt-5 space-y-3 text-sm"><p className="flex justify-between"><span>Subtotal</span><b>{subtotal} TND</b></p><p className="flex justify-between"><span>Tunisia delivery</span><b>{shipping} TND</b></p><p className="flex justify-between border-t border-black/10 pt-4 text-base font-black"><span>Total</span><span>{subtotal + shipping} TND</span></p></div>{items.length > 0 && <Link href={`/checkout?product=${tshirtProduct.id}&size=${items[0].size}`} className="mt-7 flex h-11 w-full items-center justify-between border border-black px-4 text-[9px] font-medium uppercase tracking-[.13em] transition hover:bg-black hover:text-white">Continue to order <span>↗</span></Link>}<p className="mt-5 text-[10px] leading-relaxed text-black/45">Cash on delivery · Tunisia only. A signed-in member account is required.</p></aside>
    </section>
  </main>;
}
