import { describe, expect, it } from "vitest";
import { calculateShippingQuote } from "./shipping";

describe("calculateShippingQuote", () => {
  it("normalizes a formatted CEP and returns the São Paulo estimate", () => {
    expect(calculateShippingQuote("01001-000")).toMatchObject({
      postalCode: "01001000",
      region: "São Paulo · capital e região",
      priceCents: 1990,
      deliveryEstimate: "3 a 6 dias úteis",
      source: "regional_estimate",
    });
  });

  it("returns a different estimate for the North region", () => {
    expect(calculateShippingQuote("79000-000")).toMatchObject({
      region: "Norte",
      priceCents: 4990,
      deliveryEstimate: "10 a 15 dias úteis",
    });
  });

  it("rejects incomplete or invalid CEP values", () => {
    expect(() => calculateShippingQuote("0100")).toThrow("CEP válido");
    expect(() => calculateShippingQuote("abcdefgh")).toThrow("CEP válido");
  });
});
