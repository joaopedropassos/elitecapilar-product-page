import type { Express } from "express";
import { ENV } from "./_core/env";

const MERCADO_PAGO_API = "https://api.mercadopago.com";

export const PRODUCT = {
  id: "elitecapilar-micro-stubble-001",
  title: "Sistema Capilar de Micro-Stubble Aero-Densidade",
  unitPrice: 1250,
  currencyId: "BRL",
};

function mercadoPagoHeaders() {
  if (!ENV.mercadoPagoAccessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  }

  return {
    Authorization: `Bearer ${ENV.mercadoPagoAccessToken}`,
    "Content-Type": "application/json",
  };
}

async function mercadoPagoFetch(input: string, init: RequestInit, maxAttempts = 3) {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      if (response.ok || (response.status < 500 && response.status !== 429)) return response;
      lastError = new Error(`Mercado Pago HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
    if (attempt < maxAttempts - 1) await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
  }
  console.error("[Mercado Pago] API connection failed after retries", lastError instanceof Error ? lastError.name : "unknown_error");
  throw new Error("Mercado Pago temporariamente indisponível");
}

export async function createMercadoPagoPreference(quantity = 1) {
  const safeQuantity = Math.max(1, Math.min(Math.floor(quantity), 10));
  const externalReference = `elitecapilar-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const siteUrl = ENV.publicSiteUrl;

  const response = await mercadoPagoFetch(`${MERCADO_PAGO_API}/checkout/preferences`, {
    method: "POST",
    headers: mercadoPagoHeaders(),
    body: JSON.stringify({
      items: [
        {
          id: PRODUCT.id,
          title: PRODUCT.title,
          description: "Efeito careca por fazer · densidade 25–30%",
          quantity: safeQuantity,
          currency_id: PRODUCT.currencyId,
          unit_price: PRODUCT.unitPrice,
        },
      ],
      back_urls: {
        success: `${siteUrl}/?payment=success`,
        failure: `${siteUrl}/?payment=failure`,
        pending: `${siteUrl}/?payment=pending`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
      external_reference: externalReference,
      statement_descriptor: "ELITECAPILAR",
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Mercado Pago] Preference creation failed", response.status, errorBody.slice(0, 500));
    throw new Error("Não foi possível iniciar o checkout do Mercado Pago");
  }

  const preference = await response.json() as {
    id?: string;
    init_point?: string;
    sandbox_init_point?: string;
    external_reference?: string;
  };

  const checkoutUrl = preference.init_point ?? preference.sandbox_init_point;
  if (!checkoutUrl) {
    throw new Error("O Mercado Pago não retornou uma URL de checkout");
  }

  return {
    preferenceId: preference.id ?? null,
    checkoutUrl,
    externalReference: preference.external_reference ?? externalReference,
  };
}

export async function createPromotionalPixPreference(email: string) {
  const externalReference = `elitecapilar-pix-499-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const siteUrl = ENV.publicSiteUrl;
  const response = await mercadoPagoFetch(`${MERCADO_PAGO_API}/checkout/preferences`, {
    method: "POST",
    headers: mercadoPagoHeaders(),
    body: JSON.stringify({
      items: [{
        id: "elitecapilar-micro-stubble-pix-promo",
        title: "Sistema Capilar Micro-Stubble · Oferta Pix",
        description: "Oferta promocional com pagamento exclusivo via Pix",
        quantity: 1,
        currency_id: "BRL",
        unit_price: 499,
      }],
      payer: { email },
      back_urls: {
        success: `${siteUrl}/?payment=success&offer=pix499`,
        failure: `${siteUrl}/?payment=failure&offer=pix499`,
        pending: `${siteUrl}/?payment=pending&offer=pix499`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
      external_reference: externalReference,
      metadata: { offer: "pix499", customer_email: email },
      payment_methods: {
        default_payment_method_id: "pix",
        excluded_payment_types: [
          { id: "credit_card" },
          { id: "debit_card" },
          { id: "ticket" },
          { id: "atm" },
        ],
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Mercado Pago] Promotional Pix preference failed", response.status, errorBody.slice(0, 500));
    throw new Error("Não foi possível criar o link promocional Pix");
  }

  const preference = await response.json() as { id?: string; init_point?: string; sandbox_init_point?: string; external_reference?: string };
  const checkoutUrl = preference.init_point ?? preference.sandbox_init_point;
  if (!checkoutUrl) throw new Error("O Mercado Pago não retornou o link promocional Pix");

  return {
    preferenceId: preference.id ?? null,
    checkoutUrl,
    externalReference: preference.external_reference ?? externalReference,
  };
}

export async function createPromotionalPixPayment(email: string) {
  const externalReference = `elitecapilar-pix-payment-499-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const response = await mercadoPagoFetch(`${MERCADO_PAGO_API}/v1/payments`, {
    method: "POST",
    headers: {
      ...mercadoPagoHeaders(),
      "X-Idempotency-Key": externalReference,
    },
    body: JSON.stringify({
      transaction_amount: 499,
      description: "Sistema Capilar Micro-Stubble · Oferta Pix",
      payment_method_id: "pix",
      payer: { email },
      notification_url: `${ENV.publicSiteUrl}/api/mercadopago/webhook`,
      external_reference: externalReference,
      metadata: { offer: "pix499", customer_email: email },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Mercado Pago] Promotional Pix payment failed", response.status, errorBody.slice(0, 500));
    throw new Error("Não foi possível gerar o QR Code Pix");
  }

  const payment = await response.json() as {
    id?: number;
    status?: string;
    point_of_interaction?: { transaction_data?: { qr_code_base64?: string; qr_code?: string; ticket_url?: string } };
  };
  const transactionData = payment.point_of_interaction?.transaction_data;
  if (!payment.id || payment.status !== "pending" || !transactionData?.qr_code_base64 || !transactionData.qr_code) {
    throw new Error("O Mercado Pago não retornou os dados do Pix");
  }

  return {
    paymentId: payment.id,
    status: payment.status,
    qrCodeBase64: transactionData.qr_code_base64,
    qrCode: transactionData.qr_code,
    ticketUrl: transactionData.ticket_url ?? null,
  };
}

export function registerMercadoPagoWebhook(app: Express) {
  app.post("/api/mercadopago/webhook", async (req, res) => {
    // Acknowledge immediately so Mercado Pago does not retry while we inspect the event.
    res.status(200).json({ received: true });

    const type = req.body?.type;
    const paymentId = req.body?.data?.id ?? req.body?.id;
    if (type !== "payment" || !paymentId || !ENV.mercadoPagoAccessToken) return;

    try {
      const response = await mercadoPagoFetch(`${MERCADO_PAGO_API}/v1/payments/${encodeURIComponent(String(paymentId))}`, {
        headers: mercadoPagoHeaders(),
      });
      if (!response.ok) {
        console.error("[Mercado Pago] Payment notification lookup failed", response.status);
        return;
      }
      const payment = await response.json() as { id?: number; status?: string; external_reference?: string };
      console.log("[Mercado Pago] Payment update", {
        id: payment.id,
        status: payment.status,
        externalReference: payment.external_reference,
      });
    } catch (error) {
      console.error("[Mercado Pago] Webhook processing failed", error);
    }
  });
}
