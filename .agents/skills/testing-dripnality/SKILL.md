---
name: testing-dripnality
description: How to run and test the Dripnality Next.js storefront locally without Supabase credentials
---

# Testing the Dripnality storefront

- Start the dev server with dummy Supabase env vars, otherwise the supabase client constructor throws "supabaseUrl is required" at module load:
  `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy npm run dev` (serves on :3000).
- Without real Supabase creds, client-side fetches fail and pages fall back to hard-coded default products — that fallback path is usable for UI testing.
- Home (/) starts with a full-screen "DRIPNALITY / SCROLL TO ENTER" intro; the header/nav only appears after scrolling down. Scroll before trying to click nav or the search icon.
- The QuickView modal can overflow narrow (1024px) viewports horizontally; scroll right inside the modal to reach the details panel (eyebrow, sizes, ADD TO BAG).
- The persistent bag is stored in localStorage under key `dripnality_bag` (array of {productId, size, quantity}).
- /bag, /checkout, /account redirect to /account sign-in when unauthenticated; auth is Google OAuth via Supabase and cannot be tested without credentials — mark as untested.

## Devin Secrets Needed
- None for fallback-path UI testing. Real data/auth flows need NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for a real Supabase project.
