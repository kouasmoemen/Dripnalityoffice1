import { ImageResponse } from 'next/og';

export const alt = 'DRIPNALITY — Designed with purpose';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ alignItems: 'stretch', background: '#050505', color: 'white', display: 'flex', height: '100%', justifyContent: 'space-between', overflow: 'hidden', padding: '70px 78px', position: 'relative', width: '100%' }}>
      <div style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)', backgroundSize: '62px 62px', inset: 0, opacity: .55, position: 'absolute' }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}><div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 6 }}>DRIPNALITY / TUNISIA</div><div style={{ display: 'flex', flexDirection: 'column' }}><div style={{ fontSize: 106, fontWeight: 900, letterSpacing: -10, lineHeight: .8 }}>DRIP</div><div style={{ fontFamily: 'serif', fontSize: 102, fontStyle: 'italic', letterSpacing: -11, lineHeight: .9 }}>NALITY.</div></div><div style={{ fontSize: 20, letterSpacing: 5 }}>DESIGNED WITH PURPOSE</div></div>
      <div style={{ alignItems: 'flex-end', color: '#d9d9d9', display: 'flex', fontSize: 20, fontWeight: 600, justifyContent: 'flex-end', letterSpacing: 4, position: 'relative' }}>DROP 02 / MULTI-BALACLAVAS</div>
    </div>,
    size,
  );
}
