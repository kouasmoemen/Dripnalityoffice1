'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import QuickView, { Product } from '../components/QuickView';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { tshirtGallery, tshirtProduct } from '../lib/tshirt';
import { hoodieProducts } from '../lib/hoodies';
import { addTshirtToBag } from '../lib/commerce-client';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const tshirtCatalogProduct: Product = {
  id: tshirtProduct.id,
  name: tshirtProduct.name,
  price: tshirtProduct.price,
  color: 'White',
  image: tshirtProduct.cover,
  listingImage: tshirtProduct.cover,
  hoverImage: tshirtGallery[0],
  gallery: tshirtGallery,
  description: 'An oversized white T-shirt from the DRIPNALITY Multi-Balaclavas release.',
  soldOut: false,
  sizes: [...tshirtProduct.sizes],
  serial: tshirtProduct.serial,
};

const defaultProducts: Product[] = [tshirtCatalogProduct];

type CartItem = Product & { size: string; quantity: number };

const normalizeProduct = (product: Product): Product => ({
  ...product,
  name: product.name?.trim() || 'Untitled piece',
  color: product.color?.trim() || 'Archive',
});

const normalizeSearch = (value: string) => value.toLowerCase().replace(/[\s-]+/g, '');

const matchesSearch = (product: Product, query: string) => {
  const searchableValues = [product.name, product.color, product.serial];
  if (product.id === tshirtProduct.id) searchableValues.push('tshirt', 't-shirts', 'tee shirt', 'تيشرت', 'تي شيرت');
  return searchableValues.some((value) => value && normalizeSearch(value).includes(query));
};

function SearchIcon() {
  return <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.1" /><path d="m15.4 15.4 4.1 4.1" /></svg>;
}

function BagIcon() {
  return <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" aria-hidden="true"><path d="M5.5 8.5h13l-1 11H6.5l-1-11Z" /><path d="M8.5 8.5V6.4a3.5 3.5 0 0 1 7 0v2.1" /></svg>;
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return <svg className="h-[16px] w-[16px]" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.65" aria-hidden="true"><path d="M20.8 4.9a5.4 5.4 0 0 0-7.7 0L12 6l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 21l8.8-8.4a5.4 5.4 0 0 0 0-7.7Z" /></svg>;
}

function AccountIcon() {
  return <svg className="h-[16px] w-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true"><circle cx="12" cy="8" r="3.45" /><path d="M4.8 20c.85-4.05 3.2-6.08 7.2-6.08S18.35 15.95 19.2 20" /></svg>;
}

function MenuIcon() {
  return <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(defaultProducts);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('slug, name, price_cents, color, cover_image, hover_image, hover_video, gallery, description, is_sold_out, inventory')
          .eq('is_published', true)
          .eq('category', 'tshirts')
          .order('sort_order');

        if (error || !data?.length) {
          setCatalogProducts(defaultProducts.map(normalizeProduct));
          return;
        }

        const liveProducts = data.map((item) => {
          const databaseGallery = Array.isArray(item.gallery) ? item.gallery.filter((image): image is string => typeof image === 'string') : [];
          const originalProduct = defaultProducts.find((product) => product.id === item.slug);
          const gallery = databaseGallery.length >= 6 ? databaseGallery : originalProduct?.gallery || databaseGallery;
          const image = item.cover_image || gallery[0] || originalProduct?.image || tshirtProduct.cover;
          return normalizeProduct({
            id: item.slug,
            name: item.name,
            price: originalProduct?.price ?? item.price_cents / 100,
            color: item.color || 'Archive',
            image,
            listingImage: originalProduct?.listingImage || image,
            hoverImage: item.hover_image || undefined,
            hoverVideo: item.hover_video || undefined,
            gallery: gallery.length ? gallery : [image],
            description: item.description || 'A limited DRIPNALITY archive piece.',
            soldOut: item.is_sold_out || item.inventory < 1,
            sizes: originalProduct?.sizes,
            serial: originalProduct?.serial,
          });
        });

        setCatalogProducts(liveProducts.length ? liveProducts : defaultProducts.map(normalizeProduct));
      } catch {
        setCatalogProducts(defaultProducts.map(normalizeProduct));
      }
    };

    loadCatalog();
  }, []);

  useEffect(() => {
    const loadWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: savedRows, error: savedError } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', user.id);

      if (savedError || !savedRows?.length) {
        setWishlistedIds([]);
        return;
      }

      const productIds = savedRows.map((item) => item.product_id).filter(Boolean);
      const { data: productRows, error: productError } = await supabase
        .from('products')
        .select('slug')
        .in('id', productIds);

      if (productError) {
        setWishlistedIds([]);
        return;
      }

      setWishlistedIds((productRows ?? []).map((item) => item.slug).filter(Boolean));
    };

    loadWishlist();
  }, []);

  useGSAP(() => {
    const timeline = gsap.timeline();
    gsap.set('[data-nav]', { autoAlpha: 0, y: -14 });
    timeline
      .from('[data-brand-mark]', { y: 18, opacity: 0, duration: 0.75, ease: 'power3.out' })
      .from('[data-brand-caption]', { y: 12, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.35');

    gsap.to('[data-brand-mark]', {
      y: () => -window.innerHeight * 0.4,
      scale: () => window.innerWidth < 768 ? 0.29 : 0.14,
      transformOrigin: 'center center',
      ease: 'none',
      scrollTrigger: { trigger: '[data-brand-landing]', start: 'top top', end: 'bottom 38%', scrub: true },
    });

    gsap.to('[data-brand-caption]', {
      opacity: 0,
      y: -34,
      ease: 'none',
      scrollTrigger: { trigger: '[data-brand-landing]', start: '25% top', end: 'bottom 45%', scrub: true },
    });

    ScrollTrigger.create({
      trigger: '[data-brand-landing]',
      start: 'bottom 48%',
      onEnter: () => gsap.to('[data-nav]', { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power2.out', overwrite: true }),
      onLeaveBack: () => gsap.to('[data-nav]', { autoAlpha: 0, y: -14, duration: 0.2, ease: 'power2.in', overwrite: true }),
    });

    gsap.from('[data-hero-eyebrow], [data-hero-title], [data-hero-copy], [data-hero-action]', {
      y: 32,
      opacity: 0,
      stagger: 0.1,
      duration: 0.65,
      ease: 'power3.out',
      scrollTrigger: { trigger: '[data-hero]', start: 'top 76%' },
    });

    gsap.to('[data-hero-image]', {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
    });

    gsap.from('[data-section-heading]', {
      y: 42,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: '[data-section-heading]', start: 'top 82%' },
    });

    gsap.from('[data-product-card]', {
      y: 62,
      opacity: 0,
      stagger: 0.16,
      duration: 0.95,
      ease: 'power3.out',
      scrollTrigger: { trigger: '[data-products]', start: 'top 82%' },
    });

    gsap.from('[data-editorial-content]', {
      y: 48,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '[data-editorial]', start: 'top 75%' },
    });
  }, { scope: pageRef });

  const addToBag = (product: Product, size = 'M') => {
    if (product.id === tshirtProduct.id && ['S', 'M', 'L'].includes(size)) addTshirtToBag(size as 'S' | 'M' | 'L');
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id && item.size === size);
      if (existing) return current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...product, size, quantity: 1 }];
    });
    setBagOpen(true);
  };

  const changeQuantity = (id: string, size: string, delta: number) => {
    setCart((current) => current.flatMap((item) => {
      if (item.id !== id || item.size !== size) return [item];
      const quantity = item.quantity + delta;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  };

  const toggleWishlist = async (product: Product) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.assign('/account');
      return;
    }

    const isSaved = wishlistedIds.includes(product.id);
    setWishlistedIds((current) => {
      if (isSaved) return current.filter((id) => id !== product.id);
      return current.includes(product.id) ? current : [...current, product.id];
    });

    const { data: storedProduct, error: productError } = await supabase.from('products').select('id').eq('slug', product.id).maybeSingle();
    if (productError || !storedProduct) {
      setWishlistedIds((current) => isSaved ? [...current, product.id] : current.filter((id) => id !== product.id));
      return;
    }

    const { error } = isSaved
      ? await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', storedProduct.id)
      : await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: storedProduct.id });

    if (error) {
      setWishlistedIds((current) => isSaved ? [...current, product.id] : current.filter((id) => id !== product.id));
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const normalizedCatalogProducts = catalogProducts.map(normalizeProduct);
  const searchTerm = normalizeSearch(query.trim());
  const searchCatalog = [...normalizedCatalogProducts, ...hoodieProducts.map(normalizeProduct).filter((hoodie) => !normalizedCatalogProducts.some((product) => product.id === hoodie.id))];
  const results = searchTerm ? searchCatalog.filter((product) => matchesSearch(product, searchTerm)) : [];

  return (
    <main ref={pageRef} className="min-h-screen overflow-x-hidden bg-white text-black">
      <header data-nav className="fixed inset-x-0 top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[60px] max-w-[1600px] items-center justify-between px-4 sm:h-[64px] sm:px-8 lg:px-12">
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
            <a className="nav-link" href="#collection">T-Shirts</a>
            <Link className="nav-link" href="/tshirts">Hoodies</Link>
            <a className="nav-link" href="#story">The Studio</a>
            <a className="nav-link" href="/support">Support</a>
          </nav>
          <button className="grid size-7 place-items-center md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><MenuIcon /></button>
          <a className="absolute left-1/2 -translate-x-1/2 text-[16px] font-black tracking-[-0.08em] sm:text-[19px]" href="#top">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[7px]">®</sup></a>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button className="grid size-7 place-items-center" onClick={() => setSearchOpen(true)} aria-label="Search collection"><SearchIcon /></button>
            <button className="hidden size-7 place-items-center sm:grid" onClick={() => window.location.assign('/wishlist')} aria-label="Saved pieces"><HeartIcon filled={wishlistedIds.length > 0} /></button>
            <button className="grid size-7 place-items-center" onClick={() => window.location.assign('/account')} aria-label="Sign in or create an account"><AccountIcon /></button>
            <button className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em]" onClick={() => setBagOpen(true)} aria-label="Open shopping bag"><span className="hidden sm:inline">Bag</span><span className="grid size-7 place-items-center"><BagIcon /></span><span>({cartCount})</span></button>
          </div>
        </div>
        {menuOpen && <nav className="border-t border-black/10 bg-white px-5 py-4 md:hidden"><a onClick={() => setMenuOpen(false)} className="mobile-link" href="#collection">T-Shirts</a><Link onClick={() => setMenuOpen(false)} className="mobile-link" href="/tshirts">Hoodies</Link><a onClick={() => setMenuOpen(false)} className="mobile-link" href="#story">The Studio</a><Link onClick={() => setMenuOpen(false)} className="mobile-link" href="/support">Support</Link><Link onClick={() => setMenuOpen(false)} className="mobile-link" href="/account">Account</Link></nav>}
      </header>

      <section id="top" data-brand-landing className="relative grid h-[100svh] min-h-[580px] place-items-center overflow-hidden bg-[#f8f8f8] text-black">
        <div className="relative z-10 text-center"><h1 data-brand-mark className="text-[clamp(3.4rem,13.8vw,13.5rem)] font-black leading-none tracking-[-.115em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-1 align-top text-[clamp(.5rem,1.2vw,1rem)] tracking-normal">®</sup></h1><p data-brand-caption className="mt-6 text-[9px] font-bold tracking-[0.35em] text-black/45">DESIGNED WITH PURPOSE</p></div>
        <a className="absolute bottom-8 flex items-center gap-3 text-[9px] font-bold tracking-[0.13em]" href="#hero"><span className="h-px w-9 bg-black" />SCROLL TO ENTER</a>
      </section>

      <section id="hero" data-hero className="relative flex h-[78svh] min-h-[560px] items-end overflow-hidden bg-black text-white">
        <div data-hero-image className="absolute inset-0"><Image src="/ds black1.jpg" alt="DRIPNALITY black hoodie editorial" fill priority sizes="100vw" className="object-cover object-[60%_center] opacity-50 grayscale" /></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/15" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:52px_52px] opacity-30" />
        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 pb-14 sm:px-8 lg:px-12 lg:pb-16">
          <p data-hero-eyebrow className="mb-5 text-[9px] font-bold tracking-[0.27em] text-white/60">DRIPNALITY / DROP 02</p>
          <h1 data-hero-title className="max-w-4xl text-[clamp(3rem,7.4vw,7.5rem)] font-black leading-[.82] tracking-[-.09em]">THE QUIET<br /><span className="font-serif font-normal italic tracking-[-.11em]">statement.</span></h1>
          <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><p data-hero-copy className="max-w-[290px] text-[11px] leading-relaxed text-white/65">One considered silhouette. Built from heavyweight cotton. Made to become yours.</p><a data-hero-action className="button-light" href="#collection">View the archive <span>↘</span></a></div>
        </div>
        <a className="absolute bottom-7 right-5 z-10 hidden items-center gap-3 text-[9px] font-bold tracking-[0.15em] sm:flex lg:right-12" href="#collection"><span className="h-px w-12 bg-white" />SCROLL TO EXPLORE</a>
      </section>

      <section id="collection" className="mx-auto max-w-[1120px] px-5 py-20 sm:px-8 lg:py-28">
        <div data-section-heading className="mb-16 flex flex-col justify-between gap-8 border-b border-black/15 pb-7 md:mb-20 md:flex-row md:items-end">
          <div><p className="eyebrow">The collection / Drop 02</p><h2 className="mt-4 text-[clamp(2.8rem,6vw,6.8rem)] font-black leading-[.83] tracking-[-.08em]">Essential<br /><span className="font-serif font-normal italic tracking-[-.11em]">by design.</span></h2></div>
          <p className="max-w-xs text-[12px] leading-relaxed text-black/55">The Multi-Balaclavas oversized white T-shirt. Nothing unnecessary. Everything intentional.</p>
        </div>
        <div data-products className="grid gap-x-5 gap-y-11 md:grid-cols-2 md:gap-x-6">
          {catalogProducts.map((product, index) => <article data-product-card key={product.id} className="group" onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHoveredProductId(product.id); }} onPointerLeave={() => setHoveredProductId(null)} onPointerDown={(event) => { if (event.pointerType === 'touch') setHoveredProductId((current) => current === product.id ? null : product.id); }} onFocus={() => setHoveredProductId(product.id)} onBlur={() => setHoveredProductId(null)}>
            <div className="relative aspect-[4/5] overflow-hidden bg-black/[.045] md:aspect-[4/4.15]">
              {hoveredProductId === product.id && product.hoverVideo ? <video className="absolute inset-0 h-full w-full object-cover" src={product.hoverVideo} autoPlay loop muted playsInline preload="metadata" aria-label={`${product.name} construction video`} /> : hoveredProductId === product.id && product.hoverImage ? <Image src={product.hoverImage} alt={`${product.name} alternate view`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /> : <Image src={product.listingImage || product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]" />}
              <div className="absolute left-4 top-4 text-[9px] font-bold tracking-[0.14em]">0{index + 1} / {product.soldOut ? 'LIMITED' : 'AVAILABLE'}</div>
              <button className="absolute right-4 top-3 grid size-8 place-items-center rounded-full bg-white/90 transition hover:bg-black hover:text-white" onClick={() => toggleWishlist(product)} aria-label={`Save ${product.name}`} aria-pressed={wishlistedIds.includes(product.id)}><HeartIcon filled={wishlistedIds.includes(product.id)} /></button>
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between bg-white/95 px-3 py-2.5 text-[9px] font-bold tracking-[0.13em]"><button className="transition hover:opacity-45" onClick={() => setSelectedProduct(product)}>QUICK VIEW</button><span>{hoveredProductId === product.id ? 'VIEWING DETAIL' : product.soldOut ? 'SOLD OUT' : `${product.price} TND`}</span></div>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4"><div><h3 className="text-[12px] font-bold uppercase tracking-[0.02em]">{product.name}</h3><p className="mt-1 text-[10px] text-black/50">{product.serial || product.color} / {product.soldOut ? 'Sold out' : 'Available'}</p></div><p className="text-[12px] font-bold">{product.price} TND</p></div>
          </article>)}
        </div>
      </section>

      <section id="story" data-editorial className="relative grid min-h-[660px] overflow-hidden bg-black text-white lg:grid-cols-2">
        <div className="relative min-h-[420px]"><Image src="/ds brown1.jpg" alt="DRIPNALITY brown hoodie editorial" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover grayscale" /><div className="absolute inset-0 bg-black/20" /></div>
        <div data-editorial-content className="flex flex-col justify-between px-5 py-16 sm:px-8 lg:px-16 lg:py-20"><div><p className="eyebrow text-white/50">Designed with purpose</p><h2 className="mt-5 max-w-lg text-[clamp(3.1rem,5.4vw,6.4rem)] font-black leading-[.84] tracking-[-.09em]">FORM<br />FOLLOWS<br /><span className="font-serif font-normal italic tracking-[-.1em]">feeling.</span></h2></div><div className="mt-12 max-w-sm"><p className="text-[13px] leading-relaxed text-white/60">We focus on proportion, weight and the details you feel before anyone sees them. A uniform for moving through the world with intent.</p><a className="mt-8 inline-flex border-b border-white pb-2 text-[10px] font-bold tracking-[0.14em]" href="#service">OUR POINT OF VIEW <span className="ml-10">→</span></a></div></div>
      </section>

      <section id="service" className="relative min-h-[520px] overflow-hidden bg-black text-white sm:min-h-[620px]">
        <Image src="/ds black1.jpg" alt="DRIPNALITY studio film still" fill sizes="100vw" className="object-cover opacity-35 grayscale" />
        <video className="absolute inset-0 h-full w-full object-cover opacity-80" autoPlay loop muted playsInline preload="auto" poster="/ds black1.jpg" aria-label="DRIPNALITY brand film">
          <source src="/daf-dof.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-[1600px] flex-col justify-between px-5 py-7 sm:min-h-[620px] sm:px-8 lg:px-12 lg:py-10">
          <div className="flex items-center gap-3"><Image src="/dripnality-symbol.png" alt="DRIPNALITY symbol" width={62} height={62} className="h-11 w-11 object-contain drop-shadow-[0_1px_8px_rgba(0,0,0,.55)]" /><span className="text-[12px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></span></div>
          <div className="max-w-md"><p className="eyebrow text-white/65">Motion archive / 01</p><h2 className="mt-4 text-[clamp(2.8rem,6vw,6.8rem)] font-black leading-[.83] tracking-[-.09em]">DESIGNED<br />WITH <span className="font-serif font-normal italic tracking-[-.1em]">purpose.</span></h2><p className="mt-6 max-w-[290px] text-[11px] leading-relaxed text-white/70">A moving record of the DRIPNALITY point of view.</p></div>
        </div>
      </section>

      <Footer />

      {searchOpen && <><button className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" aria-label="Close search" onClick={() => { setSearchOpen(false); setQuery(''); }} /><section className="fixed inset-x-3 top-3 z-[51] mx-auto max-w-2xl border border-black/10 bg-white p-5 shadow-2xl sm:top-6 sm:p-7" role="dialog" aria-modal="true" aria-label="Search collection"><div className="flex items-center border-b border-black"><SearchIcon /><input autoFocus className="w-full border-0 bg-transparent px-3 py-3 text-xl font-medium outline-none placeholder:text-black/25 sm:text-2xl" placeholder="Search the collection" value={query} onChange={(event) => setQuery(event.target.value)} /><button className="px-1 text-[10px] font-bold tracking-[.12em]" onClick={() => { setSearchOpen(false); setQuery(''); }}>CLOSE</button></div>{query && <div className="mt-5 max-h-[55vh] overflow-y-auto">{results.length ? results.map((product) => <button className="flex w-full items-center gap-4 border-b border-black/10 py-3 text-left" key={product.id} onClick={() => { setSearchOpen(false); setQuery(''); if (product.id === tshirtProduct.id) { window.location.assign(`/tshirts/${tshirtProduct.id}`); return; } setSelectedProduct(product); }}><Image src={product.image} alt="" width={52} height={64} className="h-16 w-13 object-contain bg-black/[.04]" /><span className="flex-1"><b className="block text-[11px] uppercase">{product.name}</b><span className="mt-1 block text-[10px] text-black/50">{product.price} TND</span></span><span className="text-[11px]">↗</span></button>) : <p className="py-7 text-[12px] text-black/50">No products found.</p>}</div>}{!query && <p className="pt-5 text-[11px] text-black/45">Search the archive by product name or color.</p>}</section></>}

      {bagOpen && <><button className="fixed inset-0 z-40 bg-black/45" aria-label="Close bag" onClick={() => setBagOpen(false)} /><aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-white"><div className="flex items-center justify-between border-b border-black/15 px-6 py-6"><h2 className="text-[13px] font-bold uppercase tracking-[0.08em]">Shopping Bag ({cartCount})</h2><button className="text-xl" onClick={() => setBagOpen(false)}>×</button></div><div className="flex-1 overflow-y-auto px-6">{cart.length ? cart.map((item) => <div className="grid grid-cols-[88px_1fr] gap-4 border-b border-black/10 py-5" key={`${item.id}-${item.size}`}><Image src={item.image} alt={item.name} width={88} height={112} className="h-28 w-[88px] object-contain bg-black/[.04]" /><div><button className="float-right text-lg text-black/45" onClick={() => changeQuantity(item.id, item.size, -item.quantity)}>×</button><h3 className="pr-4 text-[11px] font-bold uppercase leading-snug">{item.name}</h3><p className="mt-1 text-[10px] text-black/50">Size {item.size}</p><p className="mt-3 text-[11px] font-bold">{item.price} TND</p><div className="mt-3 flex w-20 items-center justify-between border border-black/15"><button className="size-7" onClick={() => changeQuantity(item.id, item.size, -1)}>−</button><span className="text-[10px]">{item.quantity}</span><button className="size-7" onClick={() => changeQuantity(item.id, item.size, 1)}>+</button></div></div></div>) : <div className="grid h-full place-items-center text-center"><p className="text-[12px] leading-relaxed text-black/50">Your bag is empty.<br />The next piece is waiting.</p></div>}</div><div className="border-t border-black/15 px-6 py-5"><div className="mb-2 flex justify-between text-[12px]"><span>Subtotal</span><b>{subtotal} TND</b></div><p className="mb-5 text-[9px] text-black/50">Taxes and shipping calculated at checkout.</p><button disabled={!cart.length} className="w-full bg-black px-5 py-4 text-[10px] font-bold tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-30" onClick={() => { const tshirtItem = cart.find((item) => item.id === tshirtProduct.id); if (tshirtItem) window.location.assign(`/checkout?product=${tshirtProduct.id}&size=${tshirtItem.size}`); }}>SECURE CHECKOUT ↗</button></div></aside></>}

      <QuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToBag} />
    </main>
  );
}
