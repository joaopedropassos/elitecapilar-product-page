async function createCheckout(input) {
  const response = await fetch("http://localhost:3000/api/trpc/payments.createPromotionalPixCheckout?batch=1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 0: { json: input } }),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Checkout endpoint returned ${response.status}: ${body.slice(0, 500)}`);
  const parsed = JSON.parse(body);
  const result = parsed?.[0]?.result?.data?.json ?? parsed?.[0]?.result?.data;
  if (!result?.checkoutUrl || !String(result.checkoutUrl).includes("mercadopago")) {
    throw new Error("Promotional checkout endpoint did not return a Mercado Pago URL");
  }
  return result;
}

const result = await createCheckout({ email: "checkout-test@example.com" });
console.log(JSON.stringify({ ok: true, offer: "pix499", hasCheckoutUrl: true, preferenceId: result.preferenceId ?? null }));
