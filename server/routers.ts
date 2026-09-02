import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { attachPaymentToOrder, createOrder, getOrderStatus, listOrders, updateOrderFulfillment, updateOrderPaymentStatus } from "./db";
import { CATALOG_PRODUCTS, createCatalogDirectPixPayment, createDirectSalePixPayment, createMercadoPagoPreference, createPromotionalPixPayment, createPromotionalPixPreference, DIRECT_PIX_PRICE, PRODUCT } from "./mercadopago";
import { z } from "zod";

const directOrderInput = z.object({
  name: z.string().trim().min(3).max(160),
  email: z.string().trim().toLowerCase().email(),
  emailConfirmation: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/),
  postalCode: z.string().trim().regex(/^\d{5}-?\d{3}$/),
  street: z.string().trim().min(3).max(180),
  addressNumber: z.string().trim().min(1).max(20),
  complement: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().toUpperCase().length(2),
  consentTerms: z.literal(true),
  consentPrivacy: z.literal(true),
  website: z.string().max(0).optional(),
}).refine((data) => data.email === data.emailConfirmation, {
  message: "Os e-mails informados não coincidem",
  path: ["emailConfirmation"],
});

const catalogPixOrderInput = directOrderInput.safeExtend({
  productId: z.enum(["barba-01", "perfume-01", "roupa-01", "game-01"]),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  payments: router({
    directSalesStatus: publicProcedure.query(() => ({
      enabled: Boolean(ENV.directSalesEnabled && ENV.sellerLegalName && ENV.sellerTaxId && ENV.sellerSupportEmail && ENV.directSalesShippingEstimate),
      seller: ENV.directSalesEnabled ? {
        legalName: ENV.sellerLegalName,
        taxId: ENV.sellerTaxId,
        supportEmail: ENV.sellerSupportEmail,
        shippingEstimate: ENV.directSalesShippingEstimate,
      } : null,
    })),
    createCheckout: publicProcedure
      .input(z.object({ quantity: z.number().int().min(1).max(10).default(1) }))
      .mutation(({ input }) => createMercadoPagoPreference(input.quantity)),
    createPromotionalPixCheckout: publicProcedure
      .input(z.object({ email: z.string().trim().email() }))
      .mutation(({ input }) => createPromotionalPixPreference(input.email)),
    createPromotionalPixPayment: publicProcedure
      .input(z.object({ email: z.string().trim().email() }))
      .mutation(({ input }) => createPromotionalPixPayment(input.email)),
    createDirectOrderPix: publicProcedure
      .input(directOrderInput)
      .mutation(async ({ input }) => {
        if (!ENV.directSalesEnabled || !ENV.sellerLegalName || !ENV.sellerTaxId || !ENV.sellerSupportEmail || !ENV.directSalesShippingEstimate) {
          throw new Error("Venda direta aguardando cadastro completo do vendedor");
        }
        const orderNumber = `EC${Date.now().toString(36).toUpperCase()}${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
        const externalReference = `EC-${orderNumber}-${crypto.randomUUID().slice(0, 8)}`;
        await createOrder({
          orderNumber,
          externalReference,
          status: "creating_payment",
          productId: PRODUCT.id,
          productTitle: PRODUCT.title,
          quantity: 1,
          originalPriceCents: PRODUCT.unitPrice * 100,
          discountPercent: 10,
          totalCents: DIRECT_PIX_PRICE * 100,
          customerName: input.name,
          customerEmail: input.email,
          customerPhone: input.phone,
          postalCode: input.postalCode,
          street: input.street,
          addressNumber: input.addressNumber,
          complement: input.complement || null,
          neighborhood: input.neighborhood,
          city: input.city,
          state: input.state,
          consentTerms: input.consentTerms,
          consentPrivacy: input.consentPrivacy,
        });
        try {
          const payment = await createDirectSalePixPayment({ email: input.email, externalReference, orderNumber });
          await attachPaymentToOrder(orderNumber, payment.paymentId);
          return { ...payment, orderNumber, totalCents: DIRECT_PIX_PRICE * 100 };
        } catch (error) {
          await updateOrderPaymentStatus(externalReference, "payment_failed");
          throw error;
        }
      }),
    createCatalogOrderPix: publicProcedure
      .input(catalogPixOrderInput)
      .mutation(async ({ input }) => {
        if (!ENV.directSalesEnabled || !ENV.sellerLegalName || !ENV.sellerTaxId || !ENV.sellerSupportEmail || !ENV.directSalesShippingEstimate) {
          throw new Error("Venda direta aguardando cadastro completo do vendedor");
        }
        const product = CATALOG_PRODUCTS[input.productId];
        const orderNumber = `TC${Date.now().toString(36).toUpperCase()}${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
        const externalReference = `TC-${orderNumber}-${crypto.randomUUID().slice(0, 8)}`;
        const totalCents = Math.floor(product.fullPriceCents * 0.9);
        await createOrder({
          orderNumber,
          externalReference,
          status: "creating_payment",
          productId: input.productId,
          productTitle: product.title,
          quantity: 1,
          originalPriceCents: product.fullPriceCents,
          discountPercent: 10,
          totalCents,
          customerName: input.name,
          customerEmail: input.email,
          customerPhone: input.phone,
          postalCode: input.postalCode,
          street: input.street,
          addressNumber: input.addressNumber,
          complement: input.complement || null,
          neighborhood: input.neighborhood,
          city: input.city,
          state: input.state,
          consentTerms: input.consentTerms,
          consentPrivacy: input.consentPrivacy,
        });
        try {
          const payment = await createCatalogDirectPixPayment({ productId: input.productId, email: input.email, externalReference, orderNumber });
          await attachPaymentToOrder(orderNumber, payment.paymentId);
          return { ...payment, orderNumber, productTitle: product.title, fullPriceCents: product.fullPriceCents };
        } catch (error) {
          await updateOrderPaymentStatus(externalReference, "payment_failed");
          throw error;
        }
      }),
    getOrderStatus: publicProcedure
      .input(z.object({ orderNumber: z.string().trim().min(6).max(40), email: z.string().trim().toLowerCase().email() }))
      .query(({ input }) => getOrderStatus(input.orderNumber, input.email)),
  }),

  orders: router({
    list: adminProcedure
      .input(z.object({ limit: z.number().int().min(1).max(200).default(100) }))
      .query(({ input }) => listOrders(input.limit)),
    updateFulfillment: adminProcedure
      .input(z.object({
        orderNumber: z.string().trim().min(6).max(40),
        status: z.enum(["paid", "processing", "shipped", "delivered", "canceled", "refunded"]),
        supplierOrderReference: z.string().trim().max(100).optional(),
        trackingCode: z.string().trim().max(100).optional(),
        trackingUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
      }))
      .mutation(({ input }) => updateOrderFulfillment(input)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
