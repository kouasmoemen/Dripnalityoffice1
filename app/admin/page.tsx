'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabase';

type Drop = {
  id: string;
  title: string;
  slug: string;
  status: string;
  starts_at: string | null;
};

type Product = {
  id: string;
  name: string;
  category: string;
  inventory: number;
  is_sold_out: boolean;
};

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setChecking(false);
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') {
      setChecking(false);
      return;
    }

    setIsAdmin(true);
    const [dropsResult, productsResult] = await Promise.all([
      supabase.from('drops').select('id, title, slug, status, starts_at').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, category, inventory, is_sold_out').order('sort_order'),
    ]);
    setDrops(dropsResult.data ?? []);
    setProducts(productsResult.data ?? []);
    setChecking(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const createDrop = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setNotice('');
    setError('');
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const slug = String(form.get('slug') ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const startsAt = String(form.get('starts_at') ?? '');

    const { error: createError } = await supabase.from('drops').insert({
      title,
      slug,
      status: 'draft',
      starts_at: startsAt || null,
      is_published: false,
    });

    if (createError) {
      setError(createError.message);
    } else {
      setNotice('Draft created. Add products in Supabase, then mark the drop as live when ready.');
      event.currentTarget.reset();
      await loadDashboard();
    }
    setCreating(false);
  };

  const updateInventory = async (product: Product, soldOut: boolean) => {
    setNotice('');
    setError('');
    const { error: updateError } = await supabase.from('products').update({ is_sold_out: soldOut }).eq('id', product.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, is_sold_out: soldOut } : item));
    setNotice(`${product.name} is now ${soldOut ? 'sold out' : 'available'}.`);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-black">
      <header className="border-b border-black/10 px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]"><span className="grid size-7 place-items-center rounded-full border border-black/20 text-base font-normal">←</span> Store</Link>
          <p className="text-[14px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></p>
          <Link href="/account" className="text-[10px] font-bold uppercase tracking-[0.18em]">Account</Link>
        </div>
      </header>

      {checking ? (
        <div className="grid min-h-[70vh] place-items-center text-[10px] font-bold uppercase tracking-[0.22em] text-black/50">Checking permissions</div>
      ) : !isAdmin ? (
        <section className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 text-center">
          <div><p className="eyebrow">Restricted studio area</p><h1 className="mt-5 text-5xl font-black leading-[.83] tracking-[-.08em]">ADMIN<br />ACCESS.</h1><p className="mx-auto mt-6 max-w-sm text-sm leading-6 text-black/55">Sign in with the account assigned as an administrator after applying the DRIPNALITY database migration.</p><Link href="/account" className="mt-8 inline-flex bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-white">Go to account →</Link></div>
        </section>
      ) : (
        <section className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="flex flex-col gap-6 border-b border-black/10 pb-10 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Studio control / secure</p><h1 className="mt-4 text-[clamp(3.4rem,7vw,7rem)] font-black leading-[.78] tracking-[-.1em]">DROP<br />CONTROL.</h1></div><p className="max-w-xs text-sm leading-6 text-black/55">Build a release in private, then make it available when the inventory and assets are final.</p></div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <form onSubmit={createDrop} className="bg-black p-6 text-white sm:p-8"><p className="eyebrow text-white/55">New drop</p><h2 className="mt-4 text-3xl font-black tracking-[-.06em]">Start privately.</h2><div className="mt-8 space-y-5"><label className="block"><span className="mb-2 block text-[9px] font-bold tracking-[.15em]">DROP TITLE</span><input required name="title" className="w-full border-b border-white/35 bg-transparent py-2 outline-none focus:border-white" placeholder="DROP 02 / TITLE" /></label><label className="block"><span className="mb-2 block text-[9px] font-bold tracking-[.15em]">URL SLUG</span><input required name="slug" className="w-full border-b border-white/35 bg-transparent py-2 outline-none focus:border-white" placeholder="drop-02" /></label><label className="block"><span className="mb-2 block text-[9px] font-bold tracking-[.15em]">RELEASE DATE</span><input name="starts_at" type="datetime-local" className="w-full border-b border-white/35 bg-transparent py-2 text-white outline-none focus:border-white" /></label></div><button disabled={creating} className="mt-9 w-full bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-black disabled:opacity-60">{creating ? 'Creating…' : 'Create draft →'}</button></form>

            <div><div className="flex items-center justify-between"><p className="eyebrow">Existing drops</p><span className="text-[10px] font-bold tracking-[.14em] text-black/45">{drops.length} TOTAL</span></div><div className="mt-4 border-t border-black/15">{drops.length ? drops.map((drop) => <div key={drop.id} className="grid grid-cols-[1fr_auto] gap-4 border-b border-black/15 py-5"><div><p className="text-[13px] font-bold uppercase">{drop.title}</p><p className="mt-1 text-[10px] text-black/50">/{drop.slug}{drop.starts_at ? ` · ${new Date(drop.starts_at).toLocaleDateString()}` : ''}</p></div><span className="h-fit border border-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[.13em]">{drop.status}</span></div>) : <p className="border-b border-black/15 py-7 text-sm text-black/50">No drops found.</p>}</div></div>
          </div>

          <div className="mt-14"><div className="flex items-center justify-between"><p className="eyebrow">Product availability</p><span className="text-[10px] font-bold tracking-[.14em] text-black/45">{products.length} PIECES</span></div><div className="mt-4 border-t border-black/15">{products.map((product) => <div key={product.id} className="flex flex-col gap-4 border-b border-black/15 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[13px] font-bold uppercase">{product.name}</p><p className="mt-1 text-[10px] text-black/50">{product.category} · inventory {product.inventory}</p></div><button onClick={() => updateInventory(product, !product.is_sold_out)} className={`w-fit border px-3 py-2 text-[9px] font-bold uppercase tracking-[.14em] ${product.is_sold_out ? 'border-black bg-black text-white' : 'border-black/20 bg-transparent'}`}>{product.is_sold_out ? 'Sold out' : 'Available'}</button></div>)}</div></div>
          {notice && <p className="mt-8 border-l-2 border-black pl-3 text-sm text-black/65">{notice}</p>}
          {error && <p className="mt-8 border-l-2 border-red-700 pl-3 text-sm text-red-800">{error}</p>}
        </section>
      )}
      <Footer />
    </main>
  );
}
