'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import QuickView, { Product } from '../../components/QuickView';
import { bagCount } from '../../lib/commerce-client';
import { supabase } from '../../lib/supabase';
import { hoodieProducts } from '../../lib/hoodies';

export default function HoodiesArchivePage() {
  const [count, setCount] = useState(0);
  const [products, setProducts] = useState<Product[]>(hoodieProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  useEffect(() => {
    const updateBag = () => setCount(bagCount());
    updateBag();
    window.addEventListener('dripnality:bag-updated', updateBag);
    return () => window.removeEventListener('dripnality:bag-updated', updateBag);
  }, []);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('slug, name, price_cents, color, cover_image, hover_image, hover_video, gallery, description, is_sold_out, inventory')
          .eq('is_published', true)
          .eq('category', 'hoodies')
          .order('sort_order');

        if (error || !data?.length) return;

        const liveProducts = data.map((item) => {
          const databaseGallery = Array.isArray(item.gallery) ? item.gallery.filter((image): image is string => typeof image === 'string') : [];
          const originalProduct = hoodieProducts.find((product) => product.id === item.slug);
          const gallery = databaseGallery.length >= 6 ? databaseGallery : originalProduct?.gallery || databaseGallery;
          const image = item.cover_image || gallery[0] || originalProduct?.image || '/hoodie-black-artwork.jpg';
          return {
            id: item.slug,
            name: item.name?.trim() || 'Untitled piece',
            price: originalProduct?.price ?? item.price_cents / 100,
            color: item.color?.trim() || 'Archive',
            image,
            listingImage: originalProduct?.listingImage || image,
            hoverImage: item.hover_image || originalProduct?.hoverImage || undefined,
            hoverVideo: item.hover_video || originalProduct?.hoverVideo || undefined,
            gallery: gallery.length ? gallery : [image],
            description: item.description || 'A limited DRIPNALITY archive piece.',
            soldOut: item.is_sold_out || item.inventory < 1,
            sizes: originalProduct?.sizes,
            serial: originalProduct?.serial,
          };
        });

        if (liveProducts.length) setProducts(liveProducts);
      } catch {
        setProducts(hoodieProducts);
      }
    };
    loadCatalog();
  }, []);

  return <main className="min-h-screen bg-[#f8f8f8] text-black">
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f8f8f8]/95 backdrop-blur-md"><div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-12"><Link href="/" className="inline-flex items-center gap-2 text-[9px] font-bold tracking-[.14em]"><span className="grid size-6 place-items-center border border-black/20 text-base font-normal">←</span><span className="hidden sm:inline">COLLECTION</span></Link><Link href="/" className="text-[15px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></Link><div className="flex items-center gap-3 sm:gap-4"><Link href="/wishlist" className="text-[9px] font-bold tracking-[.12em]">SAVED</Link><Link href="/bag" className="text-[9px] font-bold tracking-[.12em]">BAG ({count})</Link><Link href="/account" className="hidden text-[9px] font-bold tracking-[.12em] sm:block">ACCOUNT</Link></div></div></header>
    <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-8 lg:px-12 lg:py-16">
      <div className="flex items-end justify-between border-b border-black/10 pb-4"><div><p className="eyebrow">Drop 01 / Hoodies</p><h1 className="mt-3 text-4xl font-black tracking-[-.07em] sm:text-6xl">THE ARCHIVE.</h1></div><p className="hidden text-[10px] font-bold tracking-[.15em] text-black/45 sm:block">02 PIECES / SOLD OUT</p></div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-x-5 gap-y-11 md:grid-cols-2 md:gap-x-6">
        {products.map((product, index) => <article key={product.id} className="group" onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHoveredProductId(product.id); }} onPointerLeave={() => setHoveredProductId(null)} onPointerDown={(event) => { if (event.pointerType === 'touch') setHoveredProductId((current) => current === product.id ? null : product.id); }} onFocus={() => setHoveredProductId(product.id)} onBlur={() => setHoveredProductId(null)}>
          <div className="relative aspect-[4/5] overflow-hidden bg-black/[.045] md:aspect-[4/4.15]">
            {hoveredProductId === product.id && product.hoverVideo ? <video className="absolute inset-0 h-full w-full object-cover" src={product.hoverVideo} autoPlay loop muted playsInline preload="metadata" aria-label={`${product.name} construction video`} /> : hoveredProductId === product.id && product.hoverImage ? <Image src={product.hoverImage} alt={`${product.name} alternate view`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /> : <Image src={product.listingImage || product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]" />}
            <div className="absolute left-4 top-4 text-[9px] font-bold tracking-[0.14em]">0{index + 1} / LIMITED</div>
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between bg-white/95 px-3 py-2.5 text-[9px] font-bold tracking-[0.13em]"><button className="transition hover:opacity-45" onClick={() => setSelectedProduct(product)}>QUICK VIEW</button><span>{hoveredProductId === product.id ? 'VIEWING DETAIL' : product.soldOut ? 'SOLD OUT' : `${product.price} TND`}</span></div>
          </div>
          <div className="mt-4 flex items-start justify-between gap-4"><div><h3 className="text-[12px] font-bold uppercase tracking-[0.02em]">{product.name}</h3><p className="mt-1 text-[10px] text-black/50">{product.serial || product.color} / {product.soldOut ? 'Sold out' : 'Available'}</p></div><p className="text-[12px] font-bold">{product.price} TND</p></div>
        </article>)}
      </div>
    </section>
    <QuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={() => setSelectedProduct(null)} />
    <Footer />
  </main>;
}
