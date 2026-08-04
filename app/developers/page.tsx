import Link from 'next/link';
import Footer from '../../components/Footer';

const studioLinks = [
  ['TikTok', 'https://www.tiktok.com/@depthxstudio'],
  ['YouTube', 'https://www.youtube.com/@DEPTHXStudio'],
  ['Facebook', 'https://www.facebook.com/profile.php?id=61585566803581'],
  ['Instagram', 'https://www.instagram.com/dep.thx/'],
];

const developerLinks = [
  ['GitHub', 'https://github.com/kouasmoemen'],
  ['LinkedIn', 'https://www.linkedin.com/in/moemen-kouas-b04968306/'],
  ['Facebook', 'https://www.facebook.com/moemen.kouas/'],
];

export default function DevelopersPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-black">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f7f5]/95 backdrop-blur-md"><div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-12"><Link href="/" className="text-[10px] font-bold uppercase tracking-[.16em]">&larr; DRIPNALITY</Link><p className="text-[10px] font-bold uppercase tracking-[.16em]">Development credit</p></div></header>
      <section className="mx-auto grid max-w-[1500px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_.8fr] lg:px-12 lg:py-24">
        <div><p className="eyebrow">DIGITAL PARTNER / TUNISIA</p><h1 className="mt-6 text-[clamp(4rem,10vw,10rem)] font-black leading-[.76] tracking-[-.1em]">DEPTHX<br />STUDIO.</h1><p className="mt-10 max-w-xl text-[clamp(1.05rem,1.6vw,1.35rem)] leading-relaxed text-black/65">A collective of young Tunisian developers building clear, considered digital experiences for the next generation of brands.</p><div className="mt-14 grid gap-2 sm:grid-cols-2"><div className="border border-black/10 bg-black px-6 py-7 text-white"><p className="text-[10px] font-bold tracking-[.16em] text-white/55">THE STUDIO</p><p className="mt-5 text-2xl font-black tracking-[-.06em]">Depthx Studio</p><p className="mt-3 max-w-xs text-sm leading-6 text-white/65">Design, development and digital systems, made from Tunisia.</p></div><div className="border border-black/10 px-6 py-7"><p className="text-[10px] font-bold tracking-[.16em] text-black/45">LEAD DEVELOPER</p><p className="mt-5 text-2xl font-black tracking-[-.06em]">Moemen Kouas</p><p className="mt-3 max-w-xs text-sm leading-6 text-black/55">Product-focused web development and considered interfaces.</p></div></div></div>
        <aside className="lg:pt-16"><div className="border-y border-black/10 py-6"><p className="text-[10px] font-bold uppercase tracking-[.16em]">Find Depthx Studio</p><div className="mt-5 grid">{studioLinks.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between border-b border-black/10 py-4 text-sm font-bold transition hover:pl-2"><span>{label}</span><span>&nearr;</span></a>)}</div></div><div className="border-b border-black/10 py-6"><p className="text-[10px] font-bold uppercase tracking-[.16em]">Developer channels</p><div className="mt-5 grid">{developerLinks.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between border-b border-black/10 py-4 text-sm font-bold transition hover:pl-2"><span>{label}</span><span>&nearr;</span></a>)}<span className="flex items-center justify-between py-4 text-sm font-bold text-black/35"><span>Instagram</span><span>Coming soon</span></span></div></div><p className="mt-8 text-[11px] leading-relaxed text-black/45">Want to work together? Reach the studio through one of its official social channels.</p></aside>
      </section>
      <Footer />
    </main>
  );
}
