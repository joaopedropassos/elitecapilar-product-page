export type ShippingQuote = {
  postalCode: string;
  region: string;
  priceCents: number;
  deliveryEstimate: string;
  source: "regional_estimate";
};

const SHIPPING_BANDS: Record<string, Omit<ShippingQuote, "postalCode" | "source">> = {
  "0": { region: "São Paulo · capital e região", priceCents: 1990, deliveryEstimate: "3 a 6 dias úteis" },
  "1": { region: "São Paulo · interior", priceCents: 2490, deliveryEstimate: "4 a 7 dias úteis" },
  "2": { region: "Rio de Janeiro e Espírito Santo", priceCents: 2990, deliveryEstimate: "5 a 8 dias úteis" },
  "3": { region: "Minas Gerais", priceCents: 2990, deliveryEstimate: "5 a 8 dias úteis" },
  "4": { region: "Bahia e Sergipe", priceCents: 3490, deliveryEstimate: "7 a 10 dias úteis" },
  "5": { region: "Nordeste", priceCents: 3990, deliveryEstimate: "8 a 12 dias úteis" },
  "6": { region: "Centro-Oeste", priceCents: 3490, deliveryEstimate: "7 a 11 dias úteis" },
  "7": { region: "Norte", priceCents: 4990, deliveryEstimate: "10 a 15 dias úteis" },
  "8": { region: "Paraná, Santa Catarina e Rio Grande do Sul", priceCents: 2990, deliveryEstimate: "6 a 9 dias úteis" },
  "9": { region: "Interior e localidades especiais", priceCents: 3990, deliveryEstimate: "7 a 11 dias úteis" },
};

export function calculateShippingQuote(postalCode: string): ShippingQuote {
  const normalized = postalCode.replace(/\D/g, "");
  if (!/^\d{8}$/.test(normalized)) throw new Error("Informe um CEP válido com 8 dígitos");
  const band = SHIPPING_BANDS[normalized[0]!];
  if (!band) throw new Error("Não foi possível calcular o frete para este CEP");
  return { postalCode: normalized, ...band, source: "regional_estimate" };
}
