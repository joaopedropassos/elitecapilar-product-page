const response = await fetch("http://localhost:3000/api/trpc/payments.createCheckout?batch=1", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 0: { json: { quantity: 1 } } }),
});
const body = await response.text();
if (!response.ok) {
  throw new Error(`Checkout endpoint returned ${response.status}: ${body.slice(0, 500)}`);
}
const parsed = JSON.parse(body);
const result = parsed?.[0]?.result?.data?.json ?? parsed?.[0]?.result?.data;
if (!result?.checkoutUrl || !String(result.checkoutUrl).includes("mercadopago")) {
  throw new Error("Checkout endpoint did not return a Mercado Pago URL");
}
console.log(JSON.stringify({ ok: true, hasCheckoutUrl: true, preferenceId: result.preferenceId ?? null }));
