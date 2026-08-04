import Image from 'next/image';
import Link from 'next/link';
import Footer from '../../components/Footer';
import { hoodies } from '../../lib/hoodies';

export default function HoodiesPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-black">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f7f5]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[9px] font-bold tracking-[.14em]"><span className="grid size-6 place-items-center border border-black/20 text-base font-normal">&larr;</span><span className="hidden sm:inline">COLLECTION</span></Link>
          <Link href="/" className="text-[15px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">&reg;</sup></Link>
          <div className="flex items-center gap-3"><Link href="/tshirts" className="text-[9px] font-bold tracking-[.12em]">T-SHIRTS</Link><Link href="/account" className="text-[9px] font-bold tracking-[.12em]">ACCOUNT</Link></div>
        </div>
      </header>

      <section className="relative isolate flex min-h-[590px] items-end overflow-hidden bg-black text-white sm:min-h-[680px]">
        <Image src="/ds black1.jpg" alt="Black Signature Zip Hoodie editorial" fill priority sizes="100vw" className="object-cover grayscale opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.92),rgba(0,0,0,.46),rgba(0,0,0,.15))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] bg-[size:58px_58px] opacity-35" />
        <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-14 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20"><p className="text-[9px] font-bold tracking-[.27em] text-white/65">DRIPNALITY / DROP 01 / ARCHIVE</p><h1 className="mt-6 max-w-4xl text-[clamp(3.6rem,9vw,9.6rem)] font-black leading-[.76] tracking-[-.1em]">THE<br />FIRST <span className="font-serif font-normal italic tracking-[-.12em]">form.</span></h1><div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><p className="max-w-[340px] text-[12px] leading-relaxed text-white/65">Two limited zip hoodies built as the opening chapter of DRIPNALITY. Preserved here as an archive, not a restock.</p><a href="#archive" className="inline-flex w-fit items-center gap-4 border-b border-white/70 pb-3 text-[10px] font-bold uppercase tracking-[.16em]">Explore the archive <span>&darr;</span></a></div></div>
      </section>

      <section id="archive" className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="flex flex-col justify-between gap-7 border-b border-black/10 pb-7 md:flex-row md:items-end"><div><p className="eyebrow">ARCHIVE / 02 PIECES</p><h2 className="mt-4 text-[clamp(2.8rem,6vw,6.6rem)] font-black leading-[.81] tracking-[-.09em]">SOLD OUT.<br /><span className="font-serif font-normal italic tracking-[-.11em]">Still present.</span></h2></div><p className="max-w-xs text-[12px] leading-relaxed text-black/55">The first release is closed. Both pieces remain visible as a record of the collection&apos;s original proportions and finish.</p></div>
        <div className="mt-12 grid gap-x-6 gap-y-14 md:grid-cols-2">{hoodies.map((hoodie, index) => <article key={hoodie.id} className="group"><Link href={`/hoodies/${hoodie.id}`} className="relative block aspect-[4/5] overflow-hidden bg-[#e9e9e6]"><Image src={hoodie.listingImage} alt={hoodie.name} fill priority={index === 0} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]" /><span className="absolute left-4 top-4 bg-white px-3 py-2 text-[9px] font-bold tracking-[.14em]">0{index + 1} / ARCHIVE</span><span className="absolute inset-x-4 bottom-4 flex items-center justify-between bg-white/95 px-4 py-3 text-[9px] font-bold tracking-[.13em]">VIEW PIECE <span>&nearr;</span></span></Link><div className="mt-5 grid grid-cols-[1fr_auto] gap-5"><div><p className="text-[9px] font-bold tracking-[.14em] text-black/45">{hoodie.serial}</p><h3 className="mt-2 text-[14px] font-bold uppercase">{hoodie.name}</h3><p className="mt-1 text-[10px] text-black/50">{hoodie.color} / Sold out</p></div><p className="text-[12px] font-bold">{hoodie.price} TND</p></div></article>)}</div>
      </section>

      <section className="relative min-h-[520px] overflow-hidden bg-black text-white sm:min-h-[640px]">
        <video className="absolute inset-0 h-full w-full object-cover opacity-75" autoPlay loop muted playsInline preload="metadata" poster="/ds brown1.jpg" aria-label="DRIPNALITY brown archive film"><source src="/vid brown22.mp4" type="video/mp4" /></video>
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto flex min-h-[520px] max-w-[1500px] flex-col justify-end px-5 py-12 sm:min-h-[640px] sm:px-8 lg:px-12 lg:py-16"><p className="text-[9px] font-bold tracking-[.25em] text-white/65">MOTION ARCHIVE / BROWN 02</p><h2 className="mt-5 max-w-3xl text-[clamp(3rem,7vw,7.6rem)] font-black leading-[.8] tracking-[-.1em]">FORM, HELD<br /><span className="font-serif font-normal italic tracking-[-.11em]">in motion.</span></h2><p className="mt-6 max-w-sm text-[12px] leading-relaxed text-white/65">The brown archive piece captured in movement, construction and detail.</p></div>
      </section>
      <Footer />
    </main>
  );
}
