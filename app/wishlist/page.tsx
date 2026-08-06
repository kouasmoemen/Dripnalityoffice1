'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import QuickView, { Product } from '../../components/QuickView';
import { getSavedProducts, setProductSaved } from '../../lib/commerce-client';
import { supabase } from '../../lib/supabase';
import { tshirtGallery, tshirtProduct } from '../../lib/tshirt';

type SavedRow = { product_id: string; products: ProductRecord | null };
type ProductRecord = { slug: string; name: string; price_cents: number; color: string | null; cover_image: string | null; hover_image: string | null; hover_video: string | null; gallery: unknown; description: string | null; is_sold_out: boolean; inventory: number };

const localTshirt: Product = { id: tshirtProduct.id, name: tshirtProduct.name, price: tshirtProduct.price, color: 'White', image: tshirtProduct.cover, gallery: tshirtGallery, description: 'An oversized white T-shirt from the DRIPNALITY Multi-Balaclavas release.', soldOut: false };

export default function WishlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/account'); return; }
      const localProducts = getSavedProducts().includes(tshirtProduct.id) ? [localTshirt] : [];
      const { data } = await supabase.from('wishlist_items').select('product_id, products(slug, name, price_cents, color, cover_image, hover_image, hover_video, gallery, description, is_sold_out, inventory)').eq('user_id', user.id).order('created_at', { ascending: false });
      const cloudProducts = ((data ?? []) as unknown as SavedRow[]).flatMap(({ products: product }) => {
        if (!product) return [];
        const gallery = Array.isArray(product.gallery) ? product.gallery.filter((image): image is string => typeof image === 'string') : [];
        const image = product.cover_image || gallery[0] || '/hoodie-black-artwork.jpg';
        return [{ id: product.slug, name: product.name, price: product.price_cents / 100, color: product.color || 'Archive', image, hoverImage: product.hover_image || undefined, hoverVideo: product.hover_video || undefined, gallery: gallery.length ? gallery : [image], description: product.description || 'A limited DRIPNALITY archive piece.', soldOut: product.is_sold_out || product.inventory < 1 }];
      });
      const all = new Map<string, Product>();
      [...cloudProducts, ...localProducts].forEach((product) => all.set(product.id, product));
      setProducts([...all.values()]);
      setLoading(false);
    };
    loadWishlist();
  }, [router]);

  const removeSaved = async (product: Product) => {
    setProductSaved(product.id, false);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: storedProduct } = await supabase.from('products').select('id').eq('slug', product.id).maybeSingle();
      if (storedProduct) await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', storedProduct.id);
    }
    setProducts((current) => current.filter((item) => item.id !== product.id));
  };

  return <main className="min-h-screen bg-[#f7f7f5] text-black"><header className="flex h-16 items-center justify-between border-b border-black/10 px-5 sm:px-8 lg:px-12"><Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.17em]"><span className="grid size-7 place-items-center rounded-full border border-black/20 text-base font-normal">←</span>Collection</Link><Link href="/" className="absolute left-1/2 -translate-x-1/2 text-[16px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></Link><Link href="/account" className="text-[10px] font-bold uppercase tracking-[.17em]">Account</Link></header><section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><p className="eyebrow">Personal archive</p><h1 className="mt-5 text-[clamp(3.5rem,9vw,9rem)] font-black leading-[.77] tracking-[-.1em]">SAVED<br />PIECES.</h1>{loading ? <p className="mt-16 text-[10px] font-bold uppercase tracking-[.18em] text-black/45">Loading saved pieces</p> : products.length ? <div className="mt-16 grid gap-6 md:grid-cols-2">{products.map((product) => <article key={product.id}><div className="relative aspect-[4/4.3] bg-black/[.04]"><Image src={product.image} alt={product.name} fill sizes="(max-width:768px) 100vw,50vw" className="object-contain"/><button onClick={() => removeSaved(product)} className="absolute right-4 top-4 bg-white px-3 py-2 text-[9px] font-bold tracking-[.13em] transition hover:bg-black hover:text-white">REMOVE</button><button onClick={() => setSelectedProduct(product)} className="absolute inset-x-4 bottom-4 flex justify-between bg-white px-4 py-3 text-[10px] font-bold tracking-[.14em]">QUICK VIEW <span>↗</span></button></div><div className="mt-4 flex justify-between gap-5"><div><h2 className="text-[12px] font-bold uppercase">{product.name}</h2><p className="mt-1 text-[10px] text-black/50">{product.color}</p></div><p className="text-[12px] font-bold">{product.price} TND</p></div></article>)}</div> : <div className="mt-14 border-t border-black/15 pt-8"><p className="max-w-sm text-sm leading-6 text-black/55">Your saved archive is empty. Use the heart on any piece to keep it here.</p><Link href="/tshirts" className="mt-7 inline-flex bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-white">Explore T-shirts →</Link></div>}</section><Footer/><QuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={() => undefined}/></main>;
}
