import { afterEach, describe, expect, it, vi } from "vitest";
import { createMercadoPagoPreference } from "./mercadopago";

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
});
