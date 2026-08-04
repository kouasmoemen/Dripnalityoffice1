'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  color: string;
  image: string;
  listingImage?: string;
  gallery: string[];
  hoverImage?: string;
  hoverVideo?: string;
  description: string;
  soldOut: boolean;
  sizes?: string[];
  serial?: string;
}

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product, size: string) => void;
}

export default function QuickView({ product, onClose, onAdd }: QuickViewProps) {
  const [activeImage, setActiveImage] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [size, setSize] = useState('M');

  useEffect(() => {
    let frame: number | undefined;
    if (product) {
      frame = window.requestAnimationFrame(() => {
        setActiveImage(product.image);
        setShowVideo(false);
        setSize('M');
      });
      document.body.style.overflow = 'hidden';
    }
    return () => { if (frame) window.cancelAnimationFrame(frame); document.body.style.overflow = ''; };
  }, [product]);

  if (!product) return null;

  const chooseImage = (image: string) => {
    setShowVideo(false);
    setActiveImage(image);
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/65 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={product.name}>
      <button className="absolute inset-0 cursor-default" aria-label="Close quick view" onClick={onClose} />
      <div className="relative z-10 grid max-h-[94svh] w-full max-w-6xl overflow-y-auto bg-white lg:grid-cols-[1.08fr_.92fr]">
        <button className="absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full bg-white text-xl shadow-sm transition hover:bg-black hover:text-white" onClick={onClose} aria-label="Close">×</button>
        <div className="flex min-h-[430px] flex-col bg-black/[.045] p-5 sm:p-8">
          <div className="relative min-h-[330px] flex-1 overflow-hidden bg-black/[.02]">
            {showVideo && product.hoverVideo ? (
              <video className="absolute inset-0 h-full w-full object-cover" src={product.hoverVideo} autoPlay loop muted playsInline controls preload="metadata" aria-label={`${product.name} construction film`} />
            ) : (
              <Image src={activeImage || product.image} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-contain" priority />
            )}
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {product.gallery.map((image, index) => (
              <button key={image} className={`relative h-20 w-16 shrink-0 border ${!showVideo && activeImage === image ? 'border-black' : 'border-transparent opacity-50'}`} onClick={() => chooseImage(image)} aria-label={`View image ${index + 1}`}>
                <Image src={image} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
            {product.hoverVideo && (
              <button className={`relative grid h-20 w-16 shrink-0 place-items-center overflow-hidden border bg-black text-[8px] font-bold tracking-[.12em] text-white ${showVideo ? 'border-black' : 'border-transparent opacity-60'}`} onClick={() => setShowVideo(true)} aria-label="Play construction video">
                <video className="absolute inset-0 h-full w-full object-cover opacity-55" src={product.hoverVideo} muted playsInline preload="metadata" />
                <span className="relative">FILM</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex min-h-[520px] flex-col p-7 sm:p-11 lg:p-14">
          <p className="text-[9px] font-bold tracking-[0.2em] text-black/45">DRIPNALITY / DROP 01</p>
          <h2 className="mt-4 text-[clamp(1.9rem,3vw,3rem)] font-black leading-[.92] tracking-[-.065em] uppercase">{product.name}</h2>
          <p className="mt-4 text-[15px] font-bold">{product.price} {product.id === 'drp-ts-003' ? 'DNT' : 'TND'}</p>
          <p className="mt-8 max-w-sm text-[12px] leading-relaxed text-black/58">{product.description}</p>
          <div className="mt-10"><p className="mb-3 text-[10px] font-bold tracking-[0.12em] uppercase">Select size</p><div className="flex gap-2">{(product.sizes || ['S', 'M', 'L', 'XL']).map((option) => <button key={option} disabled={product.soldOut} className={`grid size-11 place-items-center border text-[11px] font-bold transition ${product.soldOut ? 'cursor-not-allowed border-black/15 text-black/35 line-through' : size === option ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black'}`} onClick={() => setSize(option)}>{option}</button>)}</div></div>
          <button disabled={product.soldOut} className="mt-10 flex w-full items-center justify-between bg-black px-5 py-3.5 text-[9px] font-bold tracking-[0.14em] text-white transition disabled:cursor-not-allowed disabled:bg-black/25" onClick={() => { if (!product.soldOut) { onAdd(product, size); onClose(); } }}>{product.soldOut ? 'SOLD OUT — ARCHIVE PIECE' : 'ADD TO BAG'} <span className="text-base">{product.soldOut ? '—' : '+'}</span></button>
          <div className="mt-auto pt-12 text-[9px] font-bold tracking-[0.1em] text-black/45">{product.soldOut ? `${product.serial || 'ARCHIVE'} — THIS PIECE NOW LIVES IN THE ARCHIVE` : 'TUNISIA DELIVERY / 8 DNT'}</div>
        </div>
      </div>
    </div>
  );
}
