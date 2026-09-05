import type { Express } from "express";
import { ENV } from "./_core/env";
import { notifyOwner } from "./_core/notification";
import { getOrderByExternalReference, updateOrderPaymentStatus } from "./db";

const MERCADO_PAGO_API = "https://api.mercadopago.com";

export const PRODUCT = {
  id: "elitecapilar-micro-stubble-001",
  title: "Sistema Capilar de Micro-Stubble Aero-Densidade",
  unitPrice: 1250,
  currencyId: "BRL",
};

export const DIRECT_PIX_PRICE = 1125;

export const CATALOG_PRODUCTS = {
  "barba-01": { title: "ML Máquina Profissional sem Fio com Visor LED e Lâmina de Titânio", fullPriceCents: 8100 },
  "barba-02": { title: "ML Máquina Profissional sem Fio com Visor LED e Regulagem", fullPriceCents: 8100 },
  "perfume-01": { title: "Dominus Men Perfume de Feromônios 50 ml", fullPriceCents: 9500 },
  "perfume-02": { title: "Primacial Kit 3 Body Splash Masculino Vibration, Blunn e Infalível", fullPriceCents: 8866 },
  "perfume-03": { title: "EZ Black Eau de Parfum Masculino 100 ml", fullPriceCents: 6890 },
  "perfume-04": { title: "Lattafa Asad Tradicional Masculino 100 ml", fullPriceCents: 15500 },
  "perfume-05": { title: "Paris Elysees Vodka Wild Masculino Intense 100 ml", fullPriceCents: 6790 },
  "perfume-06": { title: "Emporio Armani Stronger With You EDT 100 ml", fullPriceCents: 44999 },
  "perfume-07": { title: "Azzaro The Most Wanted Intense EDP 100 ml", fullPriceCents: 45557 },
  "perfume-08": { title: "Armaf Club de Nuit Intense Man EDT 105 ml", fullPriceCents: 21505 },
  "perfume-09": { title: "Ralph Lauren Polo Sport EDT Masculino 100 ml", fullPriceCents: 23692 },
  "roupa-01": { title: "Kit 3 Camisetas Masculinas 100% Algodão Premium", fullPriceCents: 6799 },
  "game-01": { title: "Console PlayStation 5 Slim Edição Digital", fullPriceCents: 449000 },
  "ferramenta-01": { title: "PlayStation Store Gift Card Digital", fullPriceCents: 36000 },
  "game-02": { title: "Sony PlayStation Store Gift Card R$ 450 Digital", fullPriceCents: 36000 },
  "game-03": { title: "Sony Controle DualSense sem Fio White para PS5", fullPriceCents: 39700 },
  "game-04": { title: "Razer Gold Digital R$ 500", fullPriceCents: 50000 },
  "tech-01": { title: "Samsung Galaxy A57 12 GB 512 GB Awesome Navy", fullPriceCents: 454900 },
  "acessorio-01": { title: "Mixs Capacete Robocop Escamoteável Gladiator", fullPriceCents: 31100 },
  "tech-02": { title: "Baseus Carregador portátil MagSafe 5000 mAh 20 W", fullPriceCents: 24990 },
  "casa-01": { title: "Alphs Percarbonato de Sódio 100% Tira Manchas Calisul", fullPriceCents: 2131 },
  "suplemento-01": { title: "Soldiers Nutrition Creatina Monohidratada em Pó 100% Pura 500 g", fullPriceCents: 4419 },
  "suplemento-02": { title: "Black Skull Whey 100% HD Caramelo Macchiato 900 g", fullPriceCents: 10400 },
  "impressora-01": { title: "Bambu Lab A1 Mini 3D Cinza", fullPriceCents: 192000 },
  "impressora-02": { title: "Bambu Lab P1S Combo com AMS", fullPriceCents: 750400 },
  "game-05": { title: "Square Enix Final Fantasy VII Rebirth para PlayStation 5", fullPriceCents: 24613 },
  "notebook-01": { title: "Acer Aspire 5 Ryzen 5 16 GB 512 GB SSD", fullPriceCents: 412200 },
  "kindle-01": { title: "Amazon Capa Folio Premium Magnética para Kindle Scribe", fullPriceCents: 101700 },
  "kindle-02": { title: "Amazon Kindle Colorsoft 2024 32 GB Signature Edition", fullPriceCents: 165900 },
  "casa-02": { title: "QW-W Garrafa de Vidro 1 Litro", fullPriceCents: 3504 },
  "relogio-01": { title: "Poedagar Oldmoney Aço Inox Prata Social Luxo Premium", fullPriceCents: 11999 },
  "relogio-02": { title: "Saint Germain Chroma Masculino Preto Clássico 42 mm", fullPriceCents: 13540 },
  "relogio-03": { title: "Casio G-Shock GA-2100-1ADR Carbon Core Guard", fullPriceCents: 39981 },
  "relogio-04": { title: "Casio G-Shock DW-5600BB-1DR Digital Preto", fullPriceCents: 28211 },
  "relogio-05": { title: "OPK 6045 Quartz Masculino Preto", fullPriceCents: 2803 }
} as const;

export type CatalogProductId = keyof typeof CATALOG_PRODUCTS;

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

export async function createDirectSalePixPayment(input: { email: string; externalReference: string; orderNumber: string }) {
  const response = await mercadoPagoFetch(`${MERCADO_PAGO_API}/v1/payments`, {
    method: "POST",
    headers: {
      ...mercadoPagoHeaders(),
      "X-Idempotency-Key": input.externalReference,
    },
    body: JSON.stringify({
      transaction_amount: DIRECT_PIX_PRICE,
      description: `${PRODUCT.title} · Venda direta Pix`,
      payment_method_id: "pix",
      payer: { email: input.email },
      notification_url: `${ENV.publicSiteUrl}/api/mercadopago/webhook`,
      external_reference: input.externalReference,
      metadata: { order_number: input.orderNumber, sale_model: "direct_resale" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Mercado Pago] Direct sale Pix payment failed", response.status, errorBody.slice(0, 500));
    throw new Error("Não foi possível gerar o Pix do pedido");
  }

  const payment = await response.json() as {
    id?: number;
    status?: string;
    date_of_expiration?: string;
    point_of_interaction?: { transaction_data?: { qr_code_base64?: string; qr_code?: string; ticket_url?: string } };
  };
  const transactionData = payment.point_of_interaction?.transaction_data;
  if (!payment.id || !transactionData?.qr_code_base64 || !transactionData.qr_code) {
    throw new Error("O Mercado Pago não retornou os dados do Pix");
  }

  return {
    paymentId: String(payment.id),
    status: payment.status ?? "pending",
    qrCodeBase64: transactionData.qr_code_base64,
    qrCode: transactionData.qr_code,
    ticketUrl: transactionData.ticket_url ?? null,
    expiresAt: payment.date_of_expiration ?? null,
  };
}

export async function createCatalogDirectPixPayment(input: { email: string; externalReference: string; orderNumber: string; productId: CatalogProductId; shippingCents?: number }) {
  const product = CATALOG_PRODUCTS[input.productId];
  const totalCents = Math.floor(product.fullPriceCents * 0.9) + (input.shippingCents ?? 0);
  const response = await mercadoPagoFetch(`${MERCADO_PAGO_API}/v1/payments`, {
    method: "POST",
    headers: {
      ...mercadoPagoHeaders(),
      "X-Idempotency-Key": input.externalReference,
    },
    body: JSON.stringify({
      transaction_amount: totalCents / 100,
      description: `${product.title} · Venda direta Pix com 10% de desconto`,
      payment_method_id: "pix",
      payer: { email: input.email },
      notification_url: `${ENV.publicSiteUrl}/api/mercadopago/webhook`,
      external_reference: input.externalReference,
      metadata: { order_number: input.orderNumber, product_id: input.productId, sale_model: "direct_resale", discount_percent: 10 },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Mercado Pago] Catalog Pix payment failed", response.status, errorBody.slice(0, 500));
    throw new Error("Não foi possível gerar o Pix do produto");
  }

  const payment = await response.json() as {
    id?: number;
    status?: string;
    date_of_expiration?: string;
    point_of_interaction?: { transaction_data?: { qr_code_base64?: string; qr_code?: string; ticket_url?: string } };
  };
  const transactionData = payment.point_of_interaction?.transaction_data;
  if (!payment.id || !transactionData?.qr_code_base64 || !transactionData.qr_code) {
    throw new Error("O Mercado Pago não retornou os dados do Pix");
  }

  return {
    paymentId: String(payment.id),
    status: payment.status ?? "pending",
    qrCodeBase64: transactionData.qr_code_base64,
    qrCode: transactionData.qr_code,
    ticketUrl: transactionData.ticket_url ?? null,
    expiresAt: payment.date_of_expiration ?? null,
    totalCents,
  };
}

function orderStatusForPayment(status?: string) {
  if (status === "approved") return "paid" as const;
  if (status === "refunded" || status === "charged_back") return "refunded" as const;
  if (status === "cancelled") return "canceled" as const;
  if (status === "rejected") return "payment_failed" as const;
  return "awaiting_payment" as const;
}

export function registerMercadoPagoWebhook(app: Express) {
  app.post("/api/mercadopago/webhook", async (req, res) => {
    const type = req.body?.type;
    const paymentId = req.body?.data?.id ?? req.body?.id;
    if (type !== "payment" || !paymentId || !ENV.mercadoPagoAccessToken) {
      res.status(200).json({ received: true, ignored: true });
      return;
    }

    try {
      const response = await mercadoPagoFetch(`${MERCADO_PAGO_API}/v1/payments/${encodeURIComponent(String(paymentId))}`, {
        headers: mercadoPagoHeaders(),
      });
      if (!response.ok) {
        console.error("[Mercado Pago] Payment notification lookup failed", response.status);
        return;
      }
      const payment = await response.json() as { id?: number; status?: string; external_reference?: string };
      if (payment.external_reference?.startsWith("EC-")) {
        const previousOrder = await getOrderByExternalReference(payment.external_reference);
        const nextStatus = orderStatusForPayment(payment.status);
        await updateOrderPaymentStatus(payment.external_reference, nextStatus, payment.id ? String(payment.id) : undefined);
        if (nextStatus === "paid" && previousOrder && previousOrder.status !== "paid") {
          try {
            await notifyOwner({
              title: `Pix aprovado · Pedido ${previousOrder.orderNumber}`,
              content: [
                `Produto: ${previousOrder.productTitle}`,
                `Total: R$ ${(previousOrder.totalCents / 100).toFixed(2).replace(".", ",")}`,
                `Cliente: ${previousOrder.customerName}`,
                `E-mail: ${previousOrder.customerEmail}`,
                `Telefone: ${previousOrder.customerPhone}`,
                `Entrega: ${previousOrder.street}, ${previousOrder.addressNumber}${previousOrder.complement ? `, ${previousOrder.complement}` : ""} · ${previousOrder.neighborhood} · ${previousOrder.city}/${previousOrder.state} · CEP ${previousOrder.postalCode}`,
                "Ação: confirmar disponibilidade, comprar do fornecedor sem link próprio de afiliado e registrar o envio.",
              ].join("\n"),
            });
          } catch (notificationError) {
            console.warn("[Orders] Owner notification unavailable", notificationError instanceof Error ? notificationError.message : "unknown_error");
          }
        }
      }
      console.log("[Mercado Pago] Payment update", {
        id: payment.id,
        status: payment.status,
        externalReference: payment.external_reference,
      });
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("[Mercado Pago] Webhook processing failed", error);
      res.status(500).json({ received: false });
    }
  });
}
