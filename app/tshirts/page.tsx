'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import { AccountIcon, BagIcon, HeartIcon, SearchIcon } from '../../components/StoreIcons';
import { addTshirtToBag, bagCount, isProductSaved, setProductSaved } from '../../lib/commerce-client';
import { supabase } from '../../lib/supabase';
import { hoodies } from '../../lib/hoodies';
import { tshirtProduct } from '../../lib/tshirt';

export default function TShirtsPage() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const catalog = [
    { id: tshirtProduct.id, href: `/tshirts/${tshirtProduct.id}`, name: tshirtProduct.name, detail: '59 DNT / T-SHIRT', search: `${tshirtProduct.name} white t-shirt oversized drp-ts-003` },
    ...hoodies.map((hoodie) => ({ id: hoodie.id, href: `/hoodies/${hoodie.id}`, name: hoodie.name, detail: `ARCHIVE / ${hoodie.color.toUpperCase()}`, search: `${hoodie.name} ${hoodie.color} hoodie ${hoodie.serial}` })),
  ];
  const matches = catalog.filter((piece) => piece.search.toLowerCase().includes(query.trim().toLowerCase()));

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

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('reveal-in'); observer.unobserve(entry.target); } }), { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const requireAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/account');
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
    <main className="min-h-screen bg-[#f7f7f5] text-black"><style jsx global>{`[data-reveal]{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}.reveal-in{opacity:1!important;transform:translateY(0)!important}@media(prefers-reduced-motion:reduce){[data-reveal]{opacity:1;transform:none;transition:none}}`}</style>
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f7f5]/95 backdrop-blur-md"><div className="relative mx-auto flex h-16 max-w-[1600px] items-center px-3 sm:px-8 lg:px-12">
          <nav className="hidden gap-6 md:flex"><Link href="/hoodies" className="text-[9px] font-bold tracking-[.14em]">HOODIES</Link><Link href="/support" className="text-[9px] font-bold tracking-[.14em]">SUPPORT</Link></nav><button onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="tshirts-mobile-menu" className="w-fit text-[9px] font-bold tracking-[.14em] md:hidden">MENU <span className="ml-1 text-base font-normal leading-none">{menuOpen ? '−' : '+'}</span></button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-[15px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">&reg;</sup></Link>
          <div className="ml-auto flex items-center gap-1 sm:gap-2"><button onClick={() => { setQuery(''); setSearchOpen(true); }} className="grid size-8 place-items-center" aria-label="Search"><SearchIcon/></button><Link href="/wishlist" className="grid size-8 place-items-center" aria-label="Saved pieces"><HeartIcon/></Link><Link href="/account" className="grid size-8 place-items-center" aria-label="Account"><AccountIcon/></Link><Link href="/bag" className="flex items-center gap-1 text-[10px] font-bold tracking-[.13em]"><span className="hidden sm:inline">BAG</span><BagIcon/><span>({count})</span></Link></div>
        </div>{menuOpen && <div id="tshirts-mobile-menu" className="absolute inset-x-0 top-full border-b border-black/10 bg-[#f7f7f5] px-5 py-5 shadow-xl md:hidden"><div className="mx-auto flex max-w-[1600px] flex-col"><Link onClick={() => setMenuOpen(false)} href="/hoodies" className="border-b border-black/10 py-4 text-[10px] font-bold tracking-[.15em]">HOODIES <span className="float-right">↗</span></Link><Link onClick={() => setMenuOpen(false)} href="/support" className="border-b border-black/10 py-4 text-[10px] font-bold tracking-[.15em]">SUPPORT <span className="float-right">↗</span></Link></div></div>}
      </header>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
        <div data-reveal className="flex flex-col justify-between gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-end">
          <div><p className="eyebrow">DROP 02 / AVAILABLE NOW</p><h1 className="mt-4 text-[clamp(3rem,7vw,6.8rem)] font-black leading-[.8] tracking-[-.09em]">T-SHIRTS.</h1></div>
          <p className="max-w-xs text-[12px] leading-relaxed text-black/55">A single oversized piece, presented as the centre of the current release.</p>
        </div>

        <article data-reveal className="mx-auto mt-12 grid max-w-5xl gap-9 md:grid-cols-[minmax(0,.9fr)_minmax(280px,.7fr)] md:items-center">
          <Link href={`/tshirts/${tshirtProduct.id}`} className="relative mx-auto block aspect-[4/5] w-full max-w-[420px] overflow-hidden bg-[#e9e9e6]">
            <Image src={tshirtProduct.cover} alt={tshirtProduct.name} fill priority sizes="(max-width: 768px) 100vw, 420px" className="object-cover transition duration-700 hover:scale-[1.025]" />
            <span className="absolute left-4 top-4 bg-white px-3 py-2 text-[9px] font-bold tracking-[.14em]">NEW / DRP-TS-003</span>
          </Link>
          <div>
            <p className="eyebrow">THE MAIN RELEASE</p>
            <h2 className="mt-4 text-[clamp(2.1rem,4vw,4rem)] font-black leading-[.85] tracking-[-.08em] uppercase">Oversized<br />Multi-Balaclavas<br />White T-Shirt</h2>
            <p className="mt-5 text-[14px] font-bold">59 DNT</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-black/55">A relaxed white silhouette designed for repeat wear. Available in S, M and L.</p>
            <div className="mt-8 grid grid-cols-2 gap-2"><Link href={`/tshirts/${tshirtProduct.id}`} className="bg-black px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-[.14em] text-white">Product details</Link><button onClick={addToBag} className="border border-black/20 px-4 py-3.5 text-[10px] font-bold uppercase tracking-[.14em]">Add to bag</button></div>
            <button onClick={save} aria-pressed={saved} className="mt-4 inline-flex items-center gap-2 border-b border-black/25 pb-1 text-[10px] font-bold uppercase tracking-[.14em] transition hover:border-black">{saved ? '♥ Saved to archive' : '♡ Save to archive'}</button>
            {notice && <p role="status" className="mt-4 border-l-2 border-black pl-3 text-xs text-black/60">{notice}</p>}
          </div>
        </article>
      </section>
      <section data-reveal className="grid overflow-hidden bg-black text-white lg:grid-cols-2"><div className="relative min-h-[460px]"><Image src="/tshirt-drop/T10.jpeg" alt="DRIPNALITY T-shirt editorial" fill sizes="(max-width:1024px) 100vw,50vw" className="object-cover grayscale"/></div><div className="flex min-h-[460px] flex-col justify-between p-8 sm:p-12 lg:p-16"><div><p className="eyebrow text-white/60">DESIGNED WITH PURPOSE</p><h2 className="mt-5 text-[clamp(3rem,5.5vw,6.2rem)] font-black leading-[.82] tracking-[-.09em]">FORM<br/>FOLLOWS<br/><span className="font-serif font-normal italic tracking-[-.1em]">feeling.</span></h2></div><p className="max-w-sm text-[13px] leading-relaxed text-white/65">A visual record of proportion, graphic language and everyday movement.</p></div></section>
      <section className="relative min-h-[500px] overflow-hidden bg-black text-white"><video className="absolute inset-0 h-full w-full object-cover opacity-70" autoPlay loop muted playsInline preload="metadata" poster="/tshirt-drop/T12.jpeg"><source src="/daf-dof.mp4" type="video/mp4"/></video><div className="absolute inset-0 bg-black/45"/><div data-reveal className="relative mx-auto flex min-h-[500px] max-w-[1500px] flex-col justify-end px-5 py-12 sm:px-8 lg:px-12"><p className="text-[9px] font-bold tracking-[.25em] text-white/65">MOTION ARCHIVE / 01</p><h2 className="mt-5 text-[clamp(3rem,7vw,7.4rem)] font-black leading-[.8] tracking-[-.1em]">DESIGNED<br/>WITH <span className="font-serif font-normal italic tracking-[-.1em]">purpose.</span></h2></div></section>
      <Footer />
      {searchOpen && <><button className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm" onClick={() => setSearchOpen(false)} aria-label="Close search"/><section role="dialog" aria-modal="true" aria-label="Search the collection" className="fixed inset-x-3 top-3 z-[51] mx-auto max-w-2xl bg-white p-5 shadow-2xl sm:top-8 sm:p-8"><div className="flex border-b border-black"><SearchIcon className="my-3 size-5 shrink-0"/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pieces, colours or categories" className="w-full bg-transparent px-3 py-3 text-xl outline-none"/><button onClick={() => setSearchOpen(false)} className="text-[10px] font-bold tracking-[.14em]">CLOSE</button></div><p className="mt-4 text-[9px] font-bold tracking-[.14em] text-black/45">{query.trim() ? `${matches.length} RESULT${matches.length === 1 ? '' : 'S'}` : 'ALL PIECES'}</p><div className="mt-2">{matches.length ? matches.map((piece) => <Link onClick={() => setSearchOpen(false)} href={piece.href} key={piece.id} className="flex items-center justify-between gap-5 border-b border-black/10 py-4 text-sm font-bold transition hover:pl-2"><span>{piece.name}</span><span className="shrink-0 text-[9px] tracking-[.12em] text-black/55">{piece.detail} ↗</span></Link>) : <p className="border-b border-black/10 py-8 text-sm text-black/55">No pieces match “{query}”. Try T-shirt, black, brown or oversized.</p>}</div></section></>}
    </main>
  );
}
