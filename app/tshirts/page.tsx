import Link from 'next/link';
import Footer from '../../components/Footer';

export default function TShirtsPage() {
  return (
    <main className="min-h-screen bg-[#f8f8f8] text-black">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f8f8f8]/95 backdrop-blur-md"><div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12"><Link href="/" className="inline-flex items-center gap-2 text-[9px] font-bold tracking-[.14em]"><span className="grid size-6 place-items-center border border-black/20 text-base font-normal">←</span> HOODIES</Link><Link href="/" className="text-[15px] font-black tracking-[-.08em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[6px]">®</sup></Link><Link href="/account" className="text-[9px] font-bold tracking-[.12em]">ACCOUNT</Link></div></header>
      <section className="relative grid min-h-[calc(100svh-64px)] place-items-center overflow-hidden px-5 text-center"><p className="absolute left-5 top-8 text-[9px] font-bold tracking-[.18em] sm:left-8 lg:left-12">DROP 02 / IN DEVELOPMENT</p><div><p className="eyebrow">Next chapter</p><h1 className="mt-5 text-[clamp(4rem,13vw,13rem)] font-black leading-[.74] tracking-[-.11em]">T-<br />SHIRTS</h1><p className="mx-auto mt-8 max-w-sm text-[12px] leading-relaxed text-black/60">A considered tee program is in progress. Join the account list for the first release notice.</p><Link href="/account" className="mt-8 inline-flex min-w-48 items-center justify-between bg-black px-4 py-3 text-[9px] font-bold tracking-[.13em] text-white">GET EARLY ACCESS <span>↗</span></Link></div><p className="absolute bottom-8 text-[9px] font-bold tracking-[.18em] text-black/45">DESIGNED WITH PURPOSE</p></section>
      <Footer />
    </main>
  );
}
