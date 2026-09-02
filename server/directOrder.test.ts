import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createOrder: vi.fn(),
  attachPaymentToOrder: vi.fn(),
  updateOrderPaymentStatus: vi.fn(),
  getOrderStatus: vi.fn(),
  listOrders: vi.fn(),
  updateOrderFulfillment: vi.fn(),
  createDirectSalePixPayment: vi.fn(),
}));

vi.mock("./db", () => ({
  createOrder: mocks.createOrder,
  attachPaymentToOrder: mocks.attachPaymentToOrder,
  updateOrderPaymentStatus: mocks.updateOrderPaymentStatus,
  getOrderStatus: mocks.getOrderStatus,
  listOrders: mocks.listOrders,
  updateOrderFulfillment: mocks.updateOrderFulfillment,
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

vi.mock("./mercadopago", () => ({
  PRODUCT: { id: "elitecapilar-micro-stubble-001", title: "Sistema Capilar de Micro-Stubble Aero-Densidade", unitPrice: 1250, currencyId: "BRL" },
  DIRECT_PIX_PRICE: 1125,
  createDirectSalePixPayment: mocks.createDirectSalePixPayment,
  createMercadoPagoPreference: vi.fn(),
  createPromotionalPixPayment: vi.fn(),
  createPromotionalPixPreference: vi.fn(),
}));

import { ENV } from "./_core/env";
import { appRouter } from "./routers";

const validInput = {
  name: "Cliente Teste",
  email: "cliente@example.com",
  emailConfirmation: "cliente@example.com",
  phone: "(11) 99999-9999",
  postalCode: "01001-000",
  street: "Praça da Sé",
  addressNumber: "100",
  complement: "",
  neighborhood: "Sé",
  city: "São Paulo",
  state: "SP",
  consentTerms: true as const,
  consentPrivacy: true as const,
};

function createContext(): TrpcContext {
  return { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

function createAdminContext(): TrpcContext {
  return {
    user: { id: 1, openId: "owner", name: "Admin", email: "admin@example.com", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

beforeEach(() => {
  ENV.directSalesEnabled = true;
  ENV.sellerLegalName = "Elite Capilar Teste Ltda";
  ENV.sellerTaxId = "00.000.000/0001-00";
  ENV.sellerSupportEmail = "suporte@example.com";
  ENV.directSalesShippingEstimate = "5 a 10 dias úteis";
  mocks.createOrder.mockResolvedValue({ id: 1 });
  mocks.createDirectSalePixPayment.mockResolvedValue({ paymentId: "123", status: "pending", qrCodeBase64: "cXI=", qrCode: "000201", ticketUrl: null, expiresAt: null });
  mocks.attachPaymentToOrder.mockResolvedValue(undefined);
  mocks.updateOrderPaymentStatus.mockResolvedValue(undefined);
  mocks.listOrders.mockResolvedValue([]);
  mocks.updateOrderFulfillment.mockResolvedValue({ orderNumber: "EC123", status: "shipped" });
});

afterEach(() => vi.clearAllMocks());

describe("payments.createDirectOrderPix", () => {
  it("stores a direct order with a 10% Pix discount before creating payment", async () => {
    const result = await appRouter.createCaller(createContext()).payments.createDirectOrderPix(validInput);

    expect(mocks.createOrder).toHaveBeenCalledWith(expect.objectContaining({
      originalPriceCents: 125000,
      discountPercent: 10,
      totalCents: 112500,
      customerEmail: "cliente@example.com",
      consentTerms: true,
      consentPrivacy: true,
    }));
    expect(mocks.createDirectSalePixPayment).toHaveBeenCalledWith(expect.objectContaining({ email: "cliente@example.com" }));
    expect(mocks.attachPaymentToOrder).toHaveBeenCalledWith(expect.any(String), "123");
    expect(result).toMatchObject({ paymentId: "123", totalCents: 112500 });
  });

  it("rejects the checkout while seller identification is incomplete", async () => {
    ENV.sellerTaxId = "";
    await expect(appRouter.createCaller(createContext()).payments.createDirectOrderPix(validInput)).rejects.toThrow("Venda direta aguardando cadastro completo do vendedor");
    expect(mocks.createOrder).not.toHaveBeenCalled();
  });

  it("requires matching confirmation email", async () => {
    await expect(appRouter.createCaller(createContext()).payments.createDirectOrderPix({ ...validInput, emailConfirmation: "outro@example.com" })).rejects.toThrow();
    expect(mocks.createOrder).not.toHaveBeenCalled();
  });
});

describe("orders administration", () => {
  it("rejects order access for unauthenticated visitors", async () => {
    await expect(appRouter.createCaller(createContext()).orders.list({ limit: 100 })).rejects.toThrow();
    expect(mocks.listOrders).not.toHaveBeenCalled();
  });

  it("allows an administrator to register supplier and tracking data", async () => {
    const input = { orderNumber: "EC123456", status: "shipped" as const, supplierOrderReference: "FORN-789", trackingCode: "BR123", trackingUrl: "https://rastreamento.example/BR123" };
    await appRouter.createCaller(createAdminContext()).orders.updateFulfillment(input);
    expect(mocks.updateOrderFulfillment).toHaveBeenCalledWith(input);
  });
});
