import { NextResponse } from 'next/server';

type Customer = { email?: string; name?: string; phone?: string; city?: string; address?: string };
type RequestBody = { productId?: string; size?: string; customer?: Customer };

const recentRequests = new Map<string, number[]>();
const recipients = ['Dripnality@gmail.com', 'studiodepthx@gmail.com'];

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function readText(value: unknown, limit: number) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const period = 10 * 60 * 1000;
  const attempts = (recentRequests.get(ip) || []).filter((attempt) => now - attempt < period);
  attempts.push(now);
  recentRequests.set(ip, attempts);
  return attempts.length > 5;
}

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ message: 'Invalid request format.' }, { status: 415 });
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) return NextResponse.json({ message: 'Too many order attempts. Please wait a few minutes.' }, { status: 429 });

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !anonKey) return NextResponse.json({ message: 'Please sign in before placing an order.' }, { status: 401 });

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!userResponse.ok) return NextResponse.json({ message: 'Your session has expired. Please sign in again.' }, { status: 401 });
  const user = await userResponse.json() as { email?: string };

  const body = await request.json() as RequestBody;
  const name = readText(body.customer?.name, 120);
  const phone = readText(body.customer?.phone, 24);
  const city = readText(body.customer?.city, 120);
  const address = readText(body.customer?.address, 500);
  const size = readText(body.size, 2);
  const email = readText(body.customer?.email, 254).toLowerCase();
  const accountEmail = user.email?.trim().toLowerCase();

  if (body.productId !== 'drp-ts-003' || !['S', 'M', 'L'].includes(size) || !name || !city || !address || !/^\+?[0-9()\s-]{6,24}$/.test(phone) || !accountEmail || email !== accountEmail) {
    return NextResponse.json({ message: 'Please complete valid order details with the email of your signed-in account.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ message: 'Order delivery is not configured yet.' }, { status: 503 });
  const orderReference = `DRP-${Date.now().toString(36).toUpperCase()}`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.ORDER_FROM_EMAIL || process.env.SUPPORT_FROM_EMAIL || 'DRIPNALITY <onboarding@resend.dev>',
      to: recipients,
      reply_to: accountEmail,
      subject: `[New order ${orderReference}] DRIPNALITY T-Shirt / ${size}`,
      html: `<h1>New DRIPNALITY order</h1><p><strong>Order reference:</strong> ${orderReference}</p><table style="border-collapse:collapse"><tr><td><strong>Product</strong></td><td>Dripnality’s Oversized Multi-Balaclavas White T-Shirt</td></tr><tr><td><strong>Serial</strong></td><td>DRP-TS-003</td></tr><tr><td><strong>Size</strong></td><td>${escapeHtml(size)}</td></tr><tr><td><strong>Price</strong></td><td>59 TND</td></tr><tr><td><strong>Delivery</strong></td><td>8 TND</td></tr><tr><td><strong>Total</strong></td><td>67 TND / Cash on delivery</td></tr><tr><td><strong>Customer</strong></td><td>${escapeHtml(name)}</td></tr><tr><td><strong>Email</strong></td><td>${escapeHtml(accountEmail)}</td></tr><tr><td><strong>Phone</strong></td><td>${escapeHtml(phone)}</td></tr><tr><td><strong>City</strong></td><td>${escapeHtml(city)}</td></tr><tr><td><strong>Address</strong></td><td>${escapeHtml(address)}</td></tr></table>`,
    }),
  });

  if (!response.ok) return NextResponse.json({ message: 'We could not deliver the order. Please try again shortly.' }, { status: 502 });
  return NextResponse.json({ success: true, orderReference });
}
