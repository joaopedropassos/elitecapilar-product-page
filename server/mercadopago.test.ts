import { afterEach, describe, expect, it, vi } from "vitest";
import { createCatalogDirectPixPayment, createDirectSalePixPayment, createMercadoPagoPreference, createPromotionalPixPayment, createPromotionalPixPreference } from "./mercadopago";

afterEach(() => vi.unstubAllGlobals());

describe("Mercado Pago Checkout Pro", () => {
  it("creates a preference with Pix and card enabled without exposing the token", async () => {
    const configuredToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    expect(configuredToken).toBeTruthy();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: "pref-123",
      init_point: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref-123",
      external_reference: "elitecapilar-reference",
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createMercadoPagoPreference(1);
    const request = fetchMock.mock.calls[0];
    const options = request?.[1] as RequestInit;
    const payload = JSON.parse(String(options.body)) as {
      payment_methods: { excluded_payment_types: unknown[]; installments: number };
      back_urls: { success: string; failure: string; pending: string };
      notification_url: string;
      items: Array<{ unit_price: number; currency_id: string }>;
    };

    expect(result.checkoutUrl).toContain("mercadopago.com.br");
    const authorization = String((options.headers as Record<string, string>).Authorization ?? "");
    expect(authorization.startsWith("Bearer ")).toBe(true);
    expect(authorization.slice("Bearer ".length)).toHaveLength(configuredToken!.length);
    expect(payload.payment_methods).toMatchObject({ excluded_payment_types: [], installments: 12 });
    expect(payload.items[0]).toMatchObject({ unit_price: 1250, currency_id: "BRL" });
    expect(payload.back_urls.success).toContain("payment=success");
    expect(payload.notification_url).toContain("/api/mercadopago/webhook");
  });

  it("creates the R$ 499 promotional preference for a confirmed payer email", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: "promo-pref-123",
      init_point: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=promo-pref-123",
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createPromotionalPixPreference("cliente@example.com");
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(options.body)) as {
      payer: { email: string };
      items: Array<{ unit_price: number }>;
      payment_methods: { default_payment_method_id: string; excluded_payment_types: Array<{ id: string }> };
    };

    expect(result.checkoutUrl).toContain("mercadopago.com.br");
    expect(payload.payer.email).toBe("cliente@example.com");
    expect(payload.items[0]?.unit_price).toBe(499);
    expect(payload.payment_methods.default_payment_method_id).toBe("pix");
    expect(payload.payment_methods.excluded_payment_types.map((item) => item.id)).toContain("credit_card");
  });

  it("returns QR Code and copia e cola data for a pending Pix payment", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 987654,
      status: "pending",
      point_of_interaction: {
        transaction_data: {
          qr_code_base64: "cXItcG5n",
          qr_code: "000201pix-copia-e-cola",
          ticket_url: "https://www.mercadopago.com.br/pix/ticket/987654",
        },
      },
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createPromotionalPixPayment("cliente@example.com");

    expect(result).toMatchObject({ paymentId: 987654, status: "pending", qrCodeBase64: "cXItcG5n", qrCode: "000201pix-copia-e-cola" });
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/v1/payments");
  });

  it("creates a direct-sale Pix for R$ 1.125 linked to the order reference", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 456789,
      status: "pending",
      date_of_expiration: "2026-09-02T12:00:00.000Z",
      point_of_interaction: { transaction_data: { qr_code_base64: "cXItZGlyZWN0", qr_code: "000201pix-direto" } },
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createDirectSalePixPayment({ email: "cliente@example.com", externalReference: "EC-PEDIDO-123", orderNumber: "PEDIDO123" });
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(options.body)) as { transaction_amount: number; external_reference: string; metadata: { order_number: string; sale_model: string } };

    expect(result).toMatchObject({ paymentId: "456789", qrCode: "000201pix-direto" });
    expect(payload.transaction_amount).toBe(1125);
    expect(payload.external_reference).toBe("EC-PEDIDO-123");
    expect(payload.metadata).toEqual({ order_number: "PEDIDO123", sale_model: "direct_resale" });
    expect((options.headers as Record<string, string>)["X-Idempotency-Key"]).toBe("EC-PEDIDO-123");
  });

  it("calculates 10% Pix discount from the selected catalog product price", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 111222,
      status: "pending",
      point_of_interaction: { transaction_data: { qr_code_base64: "cXItY2F0YWxvZw==", qr_code: "000201pix-catalogo" } },
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createCatalogDirectPixPayment({ productId: "perfume-01", email: "cliente@example.com", externalReference: "TC-PEDIDO-123", orderNumber: "PEDIDO123" });
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const payload = JSON.parse(String(options.body)) as { transaction_amount: number; payment_method_id: string; metadata: { product_id: string; discount_percent: number } };

    expect(result.totalCents).toBe(8091);
    expect(payload.transaction_amount).toBe(80.91);
    expect(payload.payment_method_id).toBe("pix");
    expect(payload.metadata).toMatchObject({ product_id: "perfume-01", discount_percent: 10 });
  });
});
