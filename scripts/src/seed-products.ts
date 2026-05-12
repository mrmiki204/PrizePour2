/**
 * Creates PrizePour ticket products in Stripe.
 * Run with: pnpm --filter @workspace/scripts exec tsx src/seed-products.ts
 *
 * Idempotent — safe to run multiple times. Skips products that already exist.
 */

const TICKET_PACKAGES = [
  { qty: 1,  priceCents: 499,  label: '1 Ticket' },
  { qty: 5,  priceCents: 1999, label: '5 Tickets' },
  { qty: 10, priceCents: 3499, label: '10 Tickets' },
  { qty: 25, priceCents: 7499, label: '25 Tickets' },
];

async function getStripeCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) {
    throw new Error('Missing Replit env vars. Ensure Stripe integration is connected.');
  }

  const resp = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
    { headers: { Accept: 'application/json', X_REPLIT_TOKEN: xReplitToken } }
  );

  if (!resp.ok) throw new Error(`Credential fetch failed: ${resp.status}`);
  const data = await resp.json() as { items: Array<{ settings: { secret_key: string } }> };
  const secretKey = data.items?.[0]?.settings?.secret_key;
  if (!secretKey) throw new Error('Stripe secret key not found in integration settings.');
  return secretKey;
}

async function createProducts() {
  const Stripe = (await import('stripe')).default;
  const secretKey = await getStripeCredentials();
  const stripe = new Stripe(secretKey);

  console.log('Creating PrizePour ticket products in Stripe...\n');

  for (const pkg of TICKET_PACKAGES) {
    const searchName = `PrizePour — ${pkg.label}`;
    const existing = await stripe.products.search({ query: `name:'${searchName}' AND active:'true'` });

    if (existing.data.length > 0) {
      console.log(`✓ Already exists: ${searchName} (${existing.data[0].id})`);
      continue;
    }

    const product = await stripe.products.create({
      name: searchName,
      description: `${pkg.qty} draw ticket${pkg.qty > 1 ? 's' : ''} for any PrizePour giveaway`,
      metadata: { ticketQty: String(pkg.qty) },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: pkg.priceCents,
      currency: 'usd',
    });

    console.log(`✓ Created: ${searchName} — $${(pkg.priceCents / 100).toFixed(2)} (price: ${price.id})`);
  }

  console.log('\n✓ Done! Products are synced automatically via webhooks.');
}

createProducts().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
