'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabase';

type Drop = { id: string; title: string; slug: string; status: string; starts_at: string | null; is_published: boolean };
type Product = { id: string; slug: string; name: string; category: string; inventory: number; is_sold_out: boolean };

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setChecking(false); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') { setChecking(false); return; }
    setIsAdmin(true);
    const [dropResult, productResult] = await Promise.all([
      supabase.from('drops').select('id,title,slug,status,starts_at,is_published').order('created_at', { ascending: false }),
      supabase.from('products').select('id,slug,name,category,inventory,is_sold_out').order('sort_order'),
    ]);
    setDrops(dropResult.data || []); setProducts(productResult.data || []); setChecking(false);
  };
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const resetMessages = () => { setNotice(''); setError(''); };

  const createDrop = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); resetMessages();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    const slug = String(form.get('slug') || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const startsAt = String(form.get('starts_at') || '');
    const scheduled = Boolean(startsAt);
    const { error: result } = await supabase.from('drops').insert({ title, slug, status: scheduled ? 'scheduled' : 'draft', starts_at: startsAt || null, is_published: scheduled });
    if (result) setError(result.message); else { setNotice(scheduled ? 'Scheduled drop created. The storefront can display its countdown now.' : 'Draft drop created.'); event.currentTarget.reset(); await load(); }
    setBusy(false);
  };

  const publishDrop = async (drop: Drop) => {
    resetMessages();
    const { error: result } = await supabase.from('drops').update({ status: 'live', is_published: true, starts_at: drop.starts_at || new Date().toISOString() }).eq('id', drop.id);
    if (result) setError(result.message); else { setNotice(`${drop.title} is now live.`); await load(); }
  };

  const createProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); resetMessages();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const slug = String(form.get('slug') || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const inventory = Math.max(0, Number(form.get('inventory') || 0));
    const sizes = String(form.get('sizes') || 'S,M,L').split(',').map((value) => value.trim().toUpperCase()).filter(Boolean);
    let coverImage = String(form.get('cover_image') || '').trim() || null;
    const imageFile = form.get('image_file');
    if (imageFile instanceof File && imageFile.size > 0) {
      const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${Date.now()}-${slug}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('product-media').upload(path, imageFile, { upsert: false, contentType: imageFile.type });
      if (uploadError) { setError(uploadError.message); setBusy(false); return; }
      coverImage = supabase.storage.from('product-media').getPublicUrl(path).data.publicUrl;
    }
    const { error: result } = await supabase.from('products').insert({ drop_id: String(form.get('drop_id') || '') || null, name, slug, category: String(form.get('category') || 'tshirts'), sku: String(form.get('sku') || '').trim() || null, price_cents: Math.round(Number(form.get('price') || 0) * 100), currency: 'TND', sizes, inventory, cover_image: coverImage, gallery: coverImage ? [coverImage] : [], is_sold_out: inventory < 1, is_published: true });
    if (result) setError(result.message); else { setNotice(`${name} has been published.`); event.currentTarget.reset(); await load(); }
    setBusy(false);
  };

  const toggleAvailability = async (product: Product) => {
    resetMessages();
    const { error: result } = await supabase.from('products').update({ is_sold_out: !product.is_sold_out }).eq('id', product.id);
    if (result) setError(result.message); else { setNotice(`${product.name} updated.`); await load(); }
  };
  const removeProduct = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    resetMessages(); const { error: result } = await supabase.from('products').delete().eq('id', product.id);
    if (result) setError(result.message); else { setProducts((items) => items.filter((item) => item.id !== product.id)); setNotice(`${product.name} deleted.`); }
  };

  return <main className="min-h-screen bg-[#f5f5f3] text-black"><header className="border-b border-black/10 px-5 py-5 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1600px] items-center justify-between"><Link href="/" className="text-[10px] font-bold uppercase tracking-[.18em]">← Store</Link><p className="text-[14px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></p><Link href="/account" className="text-[10px] font-bold uppercase tracking-[.18em]">Account</Link></div></header>{checking ? <div className="grid min-h-[70vh] place-items-center text-[10px] font-bold uppercase tracking-[.22em] text-black/50">Checking permissions</div> : !isAdmin ? <section className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 text-center"><div><p className="eyebrow">Restricted studio area</p><h1 className="mt-5 text-5xl font-black leading-[.83] tracking-[-.08em]">ADMIN<br/>ACCESS.</h1><p className="mx-auto mt-6 max-w-sm text-sm leading-6 text-black/55">Sign in with the Google account assigned role admin in Supabase.</p><Link href="/account" className="mt-8 inline-flex bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-white">Go to account →</Link></div></section> : <section className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16"><div className="border-b border-black/10 pb-10"><p className="eyebrow">Studio control / secure</p><h1 className="mt-4 text-[clamp(3.4rem,7vw,7rem)] font-black leading-[.78] tracking-[-.1em]">ADMIN<br/>DASHBOARD.</h1><p className="mt-6 max-w-xl text-sm leading-6 text-black/55">Create products, prepare scheduled drops, publish a release, manage stock and remove a product from the live catalog.</p></div><div className="mt-10 grid gap-8 lg:grid-cols-2"><form onSubmit={createDrop} className="bg-black p-6 text-white sm:p-8"><p className="eyebrow text-white/55">New drop</p><h2 className="mt-4 text-3xl font-black tracking-[-.06em]">Schedule a release.</h2><div className="mt-8 grid gap-4"><input required name="title" className="border-b border-white/35 bg-transparent py-3 outline-none" placeholder="DROP 03 / TITLE"/><input required name="slug" className="border-b border-white/35 bg-transparent py-3 outline-none" placeholder="drop-03"/><input name="starts_at" type="datetime-local" className="border-b border-white/35 bg-transparent py-3 outline-none"/></div><button disabled={busy} className="mt-7 w-full bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-black">Create drop →</button></form><form onSubmit={createProduct} className="border border-black/15 p-6 sm:p-8"><p className="eyebrow">Product publisher</p><h2 className="mt-4 text-3xl font-black tracking-[-.06em]">Publish a piece.</h2><div className="mt-8 grid gap-3 sm:grid-cols-2"><input required name="name" className="border border-black/15 bg-transparent px-3 py-3 text-sm" placeholder="Product name"/><input required name="slug" className="border border-black/15 bg-transparent px-3 py-3 text-sm" placeholder="URL slug"/><input name="sku" className="border border-black/15 bg-transparent px-3 py-3 text-sm" placeholder="Serial / SKU"/><select name="drop_id" className="border border-black/15 bg-transparent px-3 py-3 text-sm"><option value="">No drop</option>{drops.map((drop) => <option key={drop.id} value={drop.id}>{drop.title}</option>)}</select><select name="category" className="border border-black/15 bg-transparent px-3 py-3 text-sm"><option value="tshirts">T-Shirts</option><option value="hoodies">Hoodies</option></select><input required name="price" type="number" min="0" step="0.01" className="border border-black/15 bg-transparent px-3 py-3 text-sm" placeholder="Price TND"/><input required name="inventory" type="number" min="0" className="border border-black/15 bg-transparent px-3 py-3 text-sm" placeholder="Inventory"/><input name="sizes" className="border border-black/15 bg-transparent px-3 py-3 text-sm" placeholder="S, M, L"/><input name="image_file" accept="image/*" type="file" className="border border-black/15 bg-transparent px-3 py-2 text-xs sm:col-span-2"/><input name="cover_image" className="border border-black/15 bg-transparent px-3 py-3 text-sm sm:col-span-2" placeholder="Optional image URL instead"/></div><button disabled={busy} className="mt-6 bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-white">Publish product →</button></form></div><div className="mt-14"><p className="eyebrow">Drops</p><div className="mt-4 border-t border-black/15">{drops.map((drop) => <div key={drop.id} className="flex flex-col gap-3 border-b border-black/15 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[13px] font-bold uppercase">{drop.title}</p><p className="mt-1 text-[10px] text-black/50">/{drop.slug}{drop.starts_at ? ` · ${new Date(drop.starts_at).toLocaleString()}` : ''}</p></div><div className="flex items-center gap-2"><span className="border border-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[.13em]">{drop.status}</span>{drop.status !== 'live' && <button onClick={() => publishDrop(drop)} className="bg-black px-3 py-2 text-[9px] font-bold uppercase tracking-[.13em] text-white">Publish now</button>}</div></div>)}</div></div><div className="mt-14"><p className="eyebrow">Products</p><div className="mt-4 border-t border-black/15">{products.map((product) => <div key={product.id} className="flex flex-col gap-4 border-b border-black/15 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[13px] font-bold uppercase">{product.name}</p><p className="mt-1 text-[10px] text-black/50">{product.slug} · {product.category} · inventory {product.inventory}</p></div><div className="flex gap-2"><button onClick={() => toggleAvailability(product)} className="border border-black/20 px-3 py-2 text-[9px] font-bold uppercase tracking-[.14em]">{product.is_sold_out ? 'Mark available' : 'Mark sold out'}</button><button onClick={() => removeProduct(product)} className="border border-red-800/25 px-3 py-2 text-[9px] font-bold uppercase tracking-[.14em] text-red-800">Delete</button></div></div>)}</div></div>{notice && <p className="mt-8 border-l-2 border-black pl-3 text-sm text-black/65">{notice}</p>}{error && <p className="mt-8 border-l-2 border-red-700 pl-3 text-sm text-red-800">{error}</p>}</section>}<Footer/></main>;
}
