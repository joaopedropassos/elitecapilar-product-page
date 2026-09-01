import { describe, expect, it } from "vitest";

describe("Mercado Pago credentials", () => {
  it("accepts the configured access token", async () => {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    expect(token, "MERCADOPAGO_ACCESS_TOKEN must be configured").toBeTruthy();

    const response = await fetch("https://api.mercadolibre.com/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.ok, `Mercado Pago credential validation returned ${response.status}`).toBe(true);
    const body = await response.json() as { id?: number; nickname?: string };
    expect(body.id).toBeTypeOf("number");
  }, 15000);
});
