const input = {
  productId: "perfume-01",
  name: "Teste Automatizado",
  email: "checkout-test@example.com",
  emailConfirmation: "checkout-test@example.com",
  phone: "(11) 99999-9999",
  postalCode: "01001-000",
  street: "Praça da Sé",
  addressNumber: "100",
  complement: "",
  neighborhood: "Sé",
  city: "São Paulo",
  state: "SP",
  consentTerms: true,
  consentPrivacy: true,
  website: "",
};

const response = await fetch("http://localhost:3000/api/trpc/payments.createCatalogOrderPix?batch=1", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 0: { json: input } }),
});
const body = await response.text();
if (!response.ok) throw new Error(`Catalog Pix endpoint returned ${response.status}: ${body.slice(0, 500)}`);
const parsed = JSON.parse(body);
const result = parsed?.[0]?.result?.data?.json ?? parsed?.[0]?.result?.data;
if (!result?.paymentId || !result?.qrCode || !result?.qrCodeBase64) {
  throw new Error("Catalog Pix did not return payment, QR Code, and copia e cola data");
}
if (result.totalCents !== 8091 || result.fullPriceCents !== 8990) {
  throw new Error(`Unexpected catalog Pix amounts: ${JSON.stringify({ totalCents: result.totalCents, fullPriceCents: result.fullPriceCents })}`);
}
console.log(JSON.stringify({ ok: true, productId: input.productId, totalCents: result.totalCents, hasQrCode: true, orderNumber: result.orderNumber }));
