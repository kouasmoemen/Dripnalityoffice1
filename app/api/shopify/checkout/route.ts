import { NextResponse } from 'next/server';

const cartCreateMutation = `
  mutation CreateDripnalityCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart { checkoutUrl }
      userErrors { field message }
    }
  }
`;

export async function POST(request: Request) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const tshirtVariantId = process.env.SHOPIFY_TSHIRT_VARIANT_ID;
  if (!domain || !token || !tshirtVariantId) {
    return NextResponse.json({ message: 'Shopify checkout is not configured yet.' }, { status: 503 });
  }

  const body = await request.json() as { productId?: string; size?: string; customer?: { email?: string; name?: string; phone?: string; city?: string; address?: string } };
  if (body.productId !== 'drp-ts-003' || !['S', 'M', 'L'].includes(body.size || '') || !body.customer?.email || !body.customer.name || !body.customer.phone || !body.customer.city || !body.customer.address) {
    return NextResponse.json({ message: 'Please complete all order details.' }, { status: 400 });
  }

  const response = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({
      query: cartCreateMutation,
      variables: {
        input: {
          lines: [{ merchandiseId: tshirtVariantId, quantity: 1, attributes: [{ key: 'Size', value: body.size }] }],
          attributes: [
            { key: 'DRIPNALITY serial', value: 'DRP-TS-003' },
            { key: 'Customer name', value: body.customer.name },
            { key: 'Phone', value: body.customer.phone },
            { key: 'City', value: body.customer.city },
            { key: 'Address', value: body.customer.address },
          ],
          buyerIdentity: { email: body.customer.email },
        },
      },
    }),
  });
  const result = await response.json() as { data?: { cartCreate?: { cart?: { checkoutUrl?: string }; userErrors?: Array<{ message: string }> } }; errors?: Array<{ message: string }> };
  const checkoutUrl = result.data?.cartCreate?.cart?.checkoutUrl;
  if (!response.ok || !checkoutUrl) {
    return NextResponse.json({ message: result.data?.cartCreate?.userErrors?.[0]?.message || result.errors?.[0]?.message || 'Shopify could not create the checkout.' }, { status: 502 });
  }
  return NextResponse.json({ checkoutUrl });
}
