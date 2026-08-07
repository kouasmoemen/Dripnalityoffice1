'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import { AccountIcon, BagIcon, HeartIcon, SearchIcon } from '../../components/StoreIcons';
import { addTshirtToBag, bagCount, isProductSaved, setProductSaved } from '../../lib/commerce-client';
import { hoodies } from '../../lib/hoodies';
import { supabase } from '../../lib/supabase';
import { tshirtProduct } from '../../lib/tshirt';

export default function TShirtsPage() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const heroLogoScale = useTransform(scrollY, [0, 190], [1, 0.56]);
  const heroLogoY = useTransform(scrollY, [0, 190], [0, -46]);
  const heroLogoOpacity = useTransform(scrollY, [0, 135, 220], [1, 0.4, 0]);
  const headerLogoOpacity = useTransform(scrollY, [0, 85, 165], [0, 0.4, 1]);
  const headerLogoY = useTransform(scrollY, [0, 165], [-8, 0]);
  const [count, setCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [query, setQuery] = useState('');
  const catalog = [
    { id: tshirtProduct.id, href: `/tshirts/${tshirtProduct.id}`, name: tshirtProduct.name, detail: '59 TND / T-SHIRT', search: `${tshirtProduct.name} white t-shirt oversized drp-ts-003` },
    ...hoodies.map((hoodie) => ({ id: hoodie.id, href: `/hoodies/${hoodie.id}`, name: hoodie.name, detail: `ARCHIVE / ${hoodie.color.toUpperCase()}`, search: `${hoodie.name} ${hoodie.color} hoodie ${hoodie.serial}` })),
  ];
  const matches = catalog.filter((piece) => piece.search.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const refresh = () => setCount(bagCount());
    const frame = requestAnimationFrame(() => {
      refresh();
      setSaved(isProductSaved(tshirtProduct.id));
    });
    window.addEventListener('dripnality:bag-updated', refresh);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('dripnality:bag-updated', refresh);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateHeader = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setHeaderVisible(window.scrollY > 60));
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateHeader);
    };
  }, []);

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.1 },
    );
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
    <main className="min-h-screen bg-[#f4f3ef] text-[#11110f]"><style jsx global>{`[data-reveal]{opacity:0;transform:translateY(24px);transition:opacity .75s ease,transform .75s cubic-bezier(.22,1,.36,1)}.reveal-in{opacity:1!important;transform:translateY(0)!important}@media(prefers-reduced-motion:reduce){[data-reveal]{opacity:1;transform:none;transition:none}}`}</style>
      <header className={`fixed inset-x-0 top-0 z-40 border-b border-black/10 bg-white text-black shadow-sm transition-[transform,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${headerVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'}`}>
        <div className="relative mx-auto flex h-12 max-w-[1920px] items-center px-5 sm:px-8 lg:px-12">
          <nav className="hidden gap-8 md:flex">
            <Link href="/hoodies" className="text-[9px] font-semibold uppercase tracking-[.16em] transition hover:opacity-50">Archive</Link>
            <Link href="/support" className="text-[9px] font-semibold uppercase tracking-[.16em] transition hover:opacity-50">Support</Link>
          </nav>
          <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="tshirts-mobile-menu" className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.16em] md:hidden">
            <span className="grid gap-1" aria-hidden="true"><i className={`block h-px w-4 bg-current transition-transform ${menuOpen ? 'translate-y-[3px] rotate-45' : ''}`} /><i className={`block h-px w-4 bg-current transition-transform ${menuOpen ? '-translate-y-[2px] -rotate-45' : ''}`} /></span>Menu
          </button>
          <motion.div style={{ opacity: headerLogoOpacity, y: headerLogoY }} className="hidden">
            <Link href="/" className="pointer-events-auto text-[16px] font-black tracking-[-.1em] sm:text-[18px]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></Link>
          </motion.div>
          <Link href="/" aria-label="DRIPNALITY home" className="hidden">
            <span className="brand-logo-cycle absolute grid size-9 place-items-center overflow-hidden"><Image src="/klk.jpg" alt="" fill unoptimized sizes="36px" className="scale-[2.25] object-cover mix-blend-multiply" /></span>
            <span translate="no" className="brand-word-cycle notranslate absolute text-[15px] font-black tracking-[-.1em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[5px]">®</sup></span>
          </Link>
          <motion.div style={{ opacity: headerLogoOpacity, y: headerLogoY }} className="pointer-events-none absolute left-1/2 -translate-x-1/2">
            <Link href="/" aria-label="DRIPNALITY home" className="pointer-events-auto relative grid h-9 w-[128px] place-items-center overflow-hidden">
              <span className="brand-logo-cycle absolute grid size-9 place-items-center overflow-hidden"><Image src="/klk.png" alt="" fill unoptimized sizes="36px" className="scale-[2.05] object-contain brightness-0" /></span>
              <span translate="no" className="brand-word-cycle notranslate absolute text-[16px] font-black tracking-[-.1em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[5px]">®</sup></span>
            </Link>
          </motion.div>
          <div className="ml-auto flex min-w-0 items-center gap-0 sm:gap-1">
            <button onClick={() => { setQuery(''); setSearchOpen(true); }} className="header-icon grid h-9 w-8 place-items-center sm:size-9" aria-label="Search"><SearchIcon /></button>
            <Link href="/wishlist" className="header-icon grid h-9 w-8 place-items-center sm:size-9" aria-label="Saved pieces"><HeartIcon /></Link>
            <Link href="/account" className="header-icon grid h-9 w-8 place-items-center sm:size-9" aria-label="Account"><AccountIcon /></Link>
            <Link href="/bag" className="header-bag flex h-9 items-center gap-1 px-1 text-[9px] font-semibold uppercase tracking-[.14em] sm:px-2"><span className="hidden sm:inline">Bag</span><BagIcon /><span>({count})</span></Link>
          </div>
        </div>
        {menuOpen && <div id="tshirts-mobile-menu" className="absolute inset-x-0 top-full border-b border-black/10 bg-white px-5 py-3 text-black shadow-xl md:hidden"><Link onClick={() => setMenuOpen(false)} href="/hoodies" className="mobile-link">Archive <span className="float-right">↗</span></Link><Link onClick={() => setMenuOpen(false)} href="/support" className="mobile-link">Support <span className="float-right">↗</span></Link></div>}
      </header>

      <section className="hidden" aria-hidden="true">
        <Image src="/dont66.png" alt="DRIPNALITY campaign" fill priority sizes="100vw" className="object-cover object-top" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.34)_0%,rgba(0,0,0,.02)_46%,rgba(0,0,0,.56)_100%)]" />
        <div className="relative mx-auto flex w-full h-full max-w-[1920px] items-center justify-center px-3 sm:px-5 md:px-8 lg:px-12">
          <motion.h1 translate="no" style={{ scale: heroLogoScale, y: heroLogoY, opacity: heroLogoOpacity }} className="notranslate origin-center whitespace-nowrap text-center text-[clamp(1.2rem,6vw,8rem)] font-black leading-[.7] tracking-[-.13em] drop-shadow-[0_5px_25px_rgba(0,0,0,.35)]">
            DRIPNALITY<span className="ml-[.05em] align-top text-[.16em] font-medium tracking-normal">®</span>
          </motion.h1>
          <div className="absolute bottom-2 left-3 sm:bottom-4 sm:left-5 md:bottom-6 md:left-8 lg:bottom-14 lg:left-12">
            <p className="text-[clamp(6px,1.5vw,9px)] font-bold uppercase tracking-[.16em] text-white">New drop out now!</p>
            <a href="#collection" className="mt-1 sm:mt-2 inline-flex h-6 sm:h-8 md:h-10 min-w-[80px] sm:min-w-[112px] md:min-w-[132px] items-center justify-between border border-white px-2 sm:px-2.5 md:px-3 text-[clamp(5px,1.2vw,8px)] font-bold uppercase tracking-[.15em] text-white transition hover:bg-white hover:text-black">Shop all <span>→</span></a>
          </div>
        </div>
      </section>

      <section className="hidden" aria-hidden="true">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(230,255,57,.23),transparent_0_25%),radial-gradient(circle_at_10%_85%,rgba(255,255,255,.1),transparent_0_32%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="pointer-events-none absolute -right-[.08em] -top-[.35em] select-none text-[clamp(12rem,33vw,38rem)] font-black leading-none tracking-[-.16em] text-white/[.035]">02</div>
        <div className="relative mx-auto flex min-h-[min(760px,100svh)] max-w-[1920px] flex-col justify-between px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="flex items-center justify-between text-[8px] font-semibold uppercase tracking-[.22em] text-white/60 sm:text-[9px]"><span>Dripnality / Tunis</span><span>Drop 02</span></div>
          <div className="max-w-5xl py-12 sm:py-16"><p className="mb-5 text-[9px] font-semibold uppercase tracking-[.28em] text-[#dfff3d] sm:text-[10px]">The independent uniform</p><h1 className="text-[clamp(4.1rem,11vw,12.5rem)] font-black leading-[.7] tracking-[-.115em]">MOVE<br />WITH<br /><span className="font-serif font-normal italic tracking-[-.12em]">purpose.</span></h1><p className="mt-8 max-w-xs text-[12px] leading-6 text-white/65 sm:text-[13px]">A limited T-shirt made for the spaces between where you are and where you are going.</p></div>
          <div className="flex flex-col gap-5 border-t border-white/20 pt-5 sm:flex-row sm:items-end sm:justify-between"><a href="#collection" className="group inline-flex h-12 w-full max-w-[260px] items-center justify-between bg-[#f4f3ef] px-4 text-[9px] font-bold uppercase tracking-[.17em] text-black transition hover:bg-[#dfff3d]">Shop the drop <span className="text-base transition-transform group-hover:translate-x-1">↗</span></a><p className="text-[8px] font-semibold uppercase tracking-[.2em] text-white/55 sm:text-right">Oversized Multi-Balaclavas<br />White T-shirt / 59 TND</p></div>
        </div>
      </section>

      <section className="hidden" aria-hidden="true">
        <div className="pointer-events-none absolute inset-x-0 top-[18%] h-px bg-black/10" />
        <div className="pointer-events-none absolute inset-x-0 top-[54%] h-px bg-black/10" />
        <div className="pointer-events-none absolute left-[9%] top-0 h-full w-px bg-black/10" />
        <div className="pointer-events-none absolute right-[9%] top-0 h-full w-px bg-black/10" />
        <div className="relative mx-auto flex min-h-[min(720px,100svh)] max-w-[1920px] flex-col justify-between px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="flex items-center justify-between text-[8px] font-semibold uppercase tracking-[.2em] text-black/55 sm:text-[9px]"><span>Dripnality® / 2026</span><span>Limited releases</span></div>
          <div className="py-10 sm:py-14"><motion.h1 translate="no" style={{ scale: heroLogoScale, y: heroLogoY, opacity: heroLogoOpacity }} className="notranslate origin-left whitespace-nowrap text-[clamp(3.9rem,13vw,15rem)] font-black leading-[.69] tracking-[-.125em]">DRIPNALITY<span className="ml-[.05em] align-top text-[.16em] font-medium tracking-normal">®</span></motion.h1><p className="mt-7 max-w-xs text-[12px] leading-6 text-black/60 sm:text-[13px]">Independent uniforms for the everyday. Designed in Tunisia, made with intention.</p></div>
          <div className="flex flex-col gap-5 border-t border-black pt-5 sm:flex-row sm:items-end sm:justify-between"><a href="#collection" className="group inline-flex h-11 w-full max-w-[220px] items-center justify-between bg-black px-4 text-[9px] font-bold uppercase tracking-[.17em] text-white transition hover:bg-black/75">Shop the drop <span className="text-base transition-transform group-hover:translate-x-1">↗</span></a><p className="text-[8px] font-semibold uppercase tracking-[.19em] text-black/55 sm:text-right">Drop 02 / Multi-Balaclavas<br />T-shirt / 59 TND</p></div>
        </div>
      </section>

      <section id="tshirts-hero" className="relative isolate flex min-h-[min(760px,100svh)] items-center justify-center overflow-hidden bg-[#f7f7f5] px-5 text-black sm:px-8 lg:px-12">
        <div className="absolute inset-x-5 top-5 h-px bg-black/15 sm:inset-x-8 sm:top-8 lg:inset-x-12 lg:top-10" />
        <div className="absolute inset-x-5 bottom-5 h-px bg-black/15 sm:inset-x-8 sm:bottom-8 lg:inset-x-12 lg:bottom-10" />
        <div className="relative flex w-full max-w-[1800px] flex-col items-center text-center">
          <motion.h1 translate="no" style={{ scale: heroLogoScale, y: heroLogoY, opacity: heroLogoOpacity }} className="notranslate origin-center whitespace-nowrap text-[clamp(3.55rem,12.9vw,15rem)] font-black leading-[.7] tracking-[-.13em]">DRIPNALITY<span className="ml-[.05em] align-top text-[.16em] font-medium tracking-normal">®</span></motion.h1>
          <p className="mt-8 max-w-[280px] text-[12px] leading-6 text-black/60 sm:mt-10 sm:text-[13px]">A new expression of the everyday uniform.</p>
          <a href="#collection" className="mt-8 inline-flex h-11 min-w-[185px] items-center justify-between bg-black px-4 text-[9px] font-bold uppercase tracking-[.17em] text-white transition hover:bg-black/75 sm:mt-10">Shop the drop <span className="text-base">↗</span></a>
        </div>
      </section>

      <section className="marquee-strip overflow-hidden bg-black py-3 text-white" aria-label="DRIPNALITY release message">
        <div className="marquee-track flex w-max whitespace-nowrap text-[9px] font-semibold uppercase tracking-[.2em] sm:text-[10px]">
          <span>DRIPNALITY&nbsp;&nbsp;•&nbsp;&nbsp;DESIGNED IN TUNISIA&nbsp;&nbsp;•&nbsp;&nbsp;DROP 02 / MULTI-BALACLAVAS&nbsp;&nbsp;•&nbsp;&nbsp;BUILT FOR EVERYDAY MOVEMENT&nbsp;&nbsp;•&nbsp;&nbsp;LIMITED RELEASE&nbsp;&nbsp;•&nbsp;&nbsp;</span>
          <span aria-hidden="true">DRIPNALITY&nbsp;&nbsp;•&nbsp;&nbsp;DESIGNED IN TUNISIA&nbsp;&nbsp;•&nbsp;&nbsp;DROP 02 / MULTI-BALACLAVAS&nbsp;&nbsp;•&nbsp;&nbsp;BUILT FOR EVERYDAY MOVEMENT&nbsp;&nbsp;•&nbsp;&nbsp;LIMITED RELEASE&nbsp;&nbsp;•&nbsp;&nbsp;</span>
          <span aria-hidden="true">DRIPNALITY&nbsp;&nbsp;•&nbsp;&nbsp;DESIGNED IN TUNISIA&nbsp;&nbsp;•&nbsp;&nbsp;DROP 02 / MULTI-BALACLAVAS&nbsp;&nbsp;•&nbsp;&nbsp;BUILT FOR EVERYDAY MOVEMENT&nbsp;&nbsp;•&nbsp;&nbsp;LIMITED RELEASE&nbsp;&nbsp;•&nbsp;&nbsp;</span>
        </div>
      </section>

      <section id="collection" data-reveal className="mx-auto max-w-[1920px] px-5 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
        <div className="grid gap-5 border-b border-black/15 pb-7 md:grid-cols-[minmax(180px,.35fr)_1fr_minmax(240px,.45fr)] md:items-end">
          <p className="eyebrow">Drop 02 / 01 piece</p>
          <h2 className="text-[clamp(3.8rem,8vw,8.5rem)] font-black leading-[.7] tracking-[-.13em]">T-SHIRTS.</h2>
          <p className="max-w-[285px] text-[12px] leading-5 text-black/55 md:justify-self-end">A limited cotton silhouette. Built with restraint, made in Tunisia.</p>
        </div>
        <article className="grid border-b border-black/15 lg:grid-cols-[minmax(0,1.34fr)_minmax(400px,.66fr)]">
          <Link href={`/tshirts/${tshirtProduct.id}`} className="group relative block min-h-[500px] overflow-hidden bg-[#d9d9d4] sm:min-h-[690px]"><Image src={tshirtProduct.cover} alt={tshirtProduct.name} fill priority sizes="(max-width: 1024px) 100vw, 67vw" className="object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.035]" /><span className="absolute left-4 top-4 border border-black/20 bg-[#f4f3ef]/95 px-3 py-2 text-[8px] font-semibold uppercase tracking-[.17em] sm:left-6 sm:top-6">New / {tshirtProduct.serial}</span><span className="absolute bottom-5 left-5 text-[8px] font-semibold uppercase tracking-[.19em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,.7)] sm:bottom-7 sm:left-7">Discover the piece <span className="ml-3">↗</span></span></Link>
          <div className="flex min-h-[560px] flex-col bg-[#ecebe7] px-6 py-7 sm:px-10 sm:py-10 lg:px-12 lg:py-12"><div className="flex justify-between border-b border-black/15 pb-4 text-[8px] font-semibold uppercase tracking-[.19em]"><span>Current release</span><span>01 / 01</span></div><div className="mt-12"><p className="text-[9px] font-semibold uppercase tracking-[.17em] text-black/52">{tshirtProduct.serial}</p><h3 className="mt-5 max-w-[520px] text-[clamp(2.5rem,3.65vw,4.45rem)] font-black leading-[.79] tracking-[-.115em] uppercase">Oversized<br />Multi-Balaclavas<br /><span className="font-serif font-normal normal-case italic tracking-[-.12em]">White T-Shirt.</span></h3><div className="mt-8 flex items-center justify-between border-y border-black/15 py-4"><span className="text-[9px] font-semibold uppercase tracking-[.16em]">S / M / L</span><span className="text-[15px] font-semibold">59 TND</span></div><p className="mt-5 max-w-md text-[12px] leading-5 text-black/55">Relaxed cotton fit with a Multi-Balaclavas back graphic. Available exclusively for delivery in Tunisia.</p></div><div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-4 pt-10"><button onClick={addToBag} className="h-11 min-w-[190px] bg-[#11110f] px-5 text-[9px] font-semibold uppercase tracking-[.16em] text-white transition hover:bg-[#3b3a35]">Add to bag</button><Link href={`/tshirts/${tshirtProduct.id}`} className="border-b border-black pb-1 text-[9px] font-semibold uppercase tracking-[.15em] transition hover:opacity-50">Product details ↗</Link><button onClick={save} aria-pressed={saved} className="w-full text-left text-[8px] font-semibold uppercase tracking-[.16em] text-black/60 transition hover:text-black">{saved ? '♥ Saved to archive' : '♡ Save to archive'}</button>{notice && <p role="status" className="w-full border-l-2 border-black pl-3 text-xs text-black/60">{notice}</p>}</div></div>
        </article>
      </section>

      <section data-reveal className="grid overflow-hidden bg-black text-white lg:grid-cols-2"><div className="relative min-h-[460px]"><Image src="/tshirt-drop/T10.jpeg" alt="DRIPNALITY T-shirt editorial" fill sizes="(max-width:1024px) 100vw,50vw" className="object-cover grayscale" /></div><div className="flex min-h-[460px] flex-col justify-between p-8 sm:p-12 lg:p-16"><div><p className="eyebrow text-white/60">DESIGNED WITH PURPOSE</p><h2 className="mt-5 text-[clamp(3rem,5.5vw,6.2rem)] font-black leading-[.82] tracking-[-.09em]">FORM<br />FOLLOWS<br /><span className="font-serif font-normal italic tracking-[-.1em]">feeling.</span></h2></div><p className="max-w-sm text-[13px] leading-relaxed text-white/65">A visual record of proportion, graphic language and everyday movement.</p></div></section>
      <section data-reveal className="relative min-h-[500px] overflow-hidden bg-black text-white"><video className="absolute inset-0 h-full w-full object-cover opacity-70" autoPlay loop muted playsInline preload="metadata" poster="/tshirt-drop/T12.jpeg"><source src="/daf-dof.mp4" type="video/mp4" /></video><div className="absolute inset-0 bg-black/45" /><div className="relative mx-auto flex min-h-[500px] max-w-[1500px] flex-col justify-end px-5 py-12 sm:px-8 lg:px-12"><p className="text-[9px] font-bold tracking-[.25em] text-white/65">MOTION ARCHIVE / 01</p><h2 className="mt-5 text-[clamp(3rem,7vw,7.4rem)] font-black leading-[.8] tracking-[-.1em]">DESIGNED<br />WITH <span className="font-serif font-normal italic tracking-[-.1em]">purpose.</span></h2></div></section>
      <Footer />

      {searchOpen && <><button className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm" onClick={() => setSearchOpen(false)} aria-label="Close search" /><section role="dialog" aria-modal="true" aria-label="Search the collection" className="fixed inset-x-3 top-3 z-[51] mx-auto max-w-2xl bg-[#f4f3ef] p-5 shadow-2xl sm:top-8 sm:p-8"><div className="flex border-b border-black"><SearchIcon className="my-3 size-5 shrink-0" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pieces, colours or categories" className="w-full bg-transparent px-3 py-3 text-xl outline-none" /><button onClick={() => setSearchOpen(false)} className="text-[10px] font-semibold tracking-[.14em]">CLOSE</button></div><p className="mt-4 text-[9px] font-semibold tracking-[.14em] text-black/45">{query.trim() ? `${matches.length} RESULT${matches.length === 1 ? '' : 'S'}` : 'ALL PIECES'}</p><div className="mt-2">{matches.length ? matches.map((piece) => <Link onClick={() => setSearchOpen(false)} href={piece.href} key={piece.id} className="flex items-center justify-between gap-5 border-b border-black/10 py-4 text-sm font-bold transition hover:pl-2"><span>{piece.name}</span><span className="shrink-0 text-[9px] tracking-[.12em] text-black/55">{piece.detail} ↗</span></Link>) : <p className="border-b border-black/10 py-8 text-sm text-black/55">No pieces match “{query}”. Try T-shirt, black, brown or oversized.</p>}</div></section></>}
    </main>
  );
}
