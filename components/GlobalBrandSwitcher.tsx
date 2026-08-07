'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function GlobalBrandSwitcher() {
  const pathname = usePathname();

  useEffect(() => {
    const shouldShow =
      pathname !== '/' && pathname !== '/tshirts' && pathname !== '/support';
    document.body.classList.toggle('has-global-brand-switcher', shouldShow);
    return () => document.body.classList.remove('has-global-brand-switcher');
  }, [pathname]);

  // The entry page and T-shirt page own their brand treatment.
  if (pathname === '/' || pathname === '/tshirts' || pathname === '/support') return null;

  return (
    <Link href="/" aria-label="DRIPNALITY home" className="global-brand-switcher fixed left-1/2 top-2 z-[60] grid h-8 w-[108px] -translate-x-1/2 place-items-center overflow-hidden sm:top-3">
      <span className="brand-logo-cycle absolute grid size-7 place-items-center overflow-hidden">
        <Image src="/klk.png" alt="" fill unoptimized sizes="28px" className="scale-[1.85] object-contain brightness-0" />
      </span>
      <span translate="no" className="brand-word-cycle notranslate absolute text-[14px] font-black tracking-[-.1em]">DRIP<span className="font-normal">NALITY</span><sup className="ml-0.5 text-[4px]">®</sup></span>
    </Link>
  );
}
