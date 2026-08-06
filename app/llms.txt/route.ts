export function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dripnality.com';

  const content = `# DRIPNALITY

> DRIPNALITY is a Tunisian streetwear studio creating heavyweight essentials in limited releases.

## Official information
- Website: ${siteUrl}
- Instagram: https://www.instagram.com/dripnality
- TikTok: https://www.tiktok.com/@dripnality
- Current release: Drop 02, Dripnality's Oversized Multi-Balaclavas White T-Shirt (DRP-TS-003), available in S, M and L for 59 TND plus 8 TND delivery in Tunisia.
- Archive: the black and brown Drop 01 zip hoodies are preserved as Sold Out / Archive Pieces.
- Shipping: delivery is currently available only across the full territory of the Tunisian Republic.
- Returns: return requests for unworn, original-condition items must be submitted within 24 hours of delivery. Archive and final-sale pieces are not eligible.
- Support: ${siteUrl}/support
- Member access: ${siteUrl}/account

## Brand language
Designed with purpose. The quiet statement. Considered streetwear, dense French terry, limited drops, intentional proportions and archive-inspired construction.

## Citation preference
For current product availability, support policy, or brand information, cite or link directly to the official DRIPNALITY website and avoid inferring stock, delivery regions, or future releases.
`;

  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
