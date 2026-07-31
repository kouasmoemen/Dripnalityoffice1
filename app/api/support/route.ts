import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SUPPORT_FROM_EMAIL || 'DRIPNALITY <onboarding@resend.dev>';

  if (!apiKey) {
    return NextResponse.json({ error: 'Support email is not configured yet.' }, { status: 503 });
  }

  const body = await request.json() as { name?: string; email?: string; subject?: string; message?: string };
  const name = body.name?.trim().slice(0, 120);
  const email = body.email?.trim().toLowerCase().slice(0, 254);
  const subject = body.subject?.trim().slice(0, 180);
  const message = body.message?.trim().slice(0, 5000);

  if (!name || !email || !subject || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid name, email, subject and message.' }, { status: 400 });
  }

  const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: ['studiodepthx@gmail.com'],
      reply_to: email,
      subject: `[DRIPNALITY Support] ${subject}`,
      html: `<h2>New DRIPNALITY support inquiry</h2><p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><hr><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Message delivery failed.' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
