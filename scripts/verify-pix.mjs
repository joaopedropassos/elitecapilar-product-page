const baseUrl = "http://localhost:3000";
const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

const createResponse = await fetch(`${baseUrl}/api/trpc/payments.createPromotionalPixCheckout?batch=1`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 0: { json: { email: "pix-validation@example.com" } } }),
});
const createBody = await createResponse.text();
if (!createResponse.ok) throw new Error(`create checkout failed (${createResponse.status}): ${createBody.slice(0, 300)}`);
const created = JSON.parse(createBody)?.[0]?.result?.data?.json;
if (!created?.preferenceId || !created?.checkoutUrl?.includes("mercadopago")) {
  throw new Error("Mercado Pago did not return a valid promotional preference");
}

if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN is not available for validation");
const preferenceResponse = await fetch(`https://api.mercadopago.com/checkout/preferences/${created.preferenceId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const preferenceBody = await preferenceResponse.text();
if (!preferenceResponse.ok) throw new Error(`preference lookup failed (${preferenceResponse.status})`);
const preference = JSON.parse(preferenceBody);
const item = preference.items?.[0];
const excluded = preference.payment_methods?.excluded_payment_types?.map((entry) => entry.id) ?? [];
if (item?.unit_price !== 499 || item?.currency_id !== "BRL") throw new Error("Preference value is not R$ 499 BRL");
if (!excluded.includes("credit_card") || !excluded.includes("debit_card")) throw new Error("Preference is not Pix-only");
if (preference.payer?.email !== "pix-validation@example.com") throw new Error("Payer email was not attached");

const webhookResponse = await fetch(`${baseUrl}/api/mercadopago/webhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ type: "test", data: { id: "validation-only" } }),
});
if (webhookResponse.status !== 200) throw new Error(`webhook returned ${webhookResponse.status}`);

console.log(JSON.stringify({ ok: true, preferenceId: created.preferenceId, value: item.unit_price, currency: item.currency_id, pixOnly: true, payerEmailAttached: true, webhookStatus: webhookResponse.status }));
