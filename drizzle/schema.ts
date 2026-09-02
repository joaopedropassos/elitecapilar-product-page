import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(),
  externalReference: varchar("externalReference", { length: 80 }).notNull().unique(),
  paymentId: varchar("paymentId", { length: 64 }),
  supplierOrderReference: varchar("supplierOrderReference", { length: 100 }),
  trackingCode: varchar("trackingCode", { length: 100 }),
  trackingUrl: varchar("trackingUrl", { length: 500 }),
  status: mysqlEnum("status", ["creating_payment", "awaiting_payment", "paid", "processing", "shipped", "delivered", "payment_failed", "canceled", "refunded"]).default("creating_payment").notNull(),
  productId: varchar("productId", { length: 80 }).notNull(),
  productTitle: varchar("productTitle", { length: 240 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  originalPriceCents: int("originalPriceCents").notNull(),
  discountPercent: int("discountPercent").default(10).notNull(),
  totalCents: int("totalCents").notNull(),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 24 }).notNull(),
  postalCode: varchar("postalCode", { length: 9 }).notNull(),
  street: varchar("street", { length: 180 }).notNull(),
  addressNumber: varchar("addressNumber", { length: 20 }).notNull(),
  complement: varchar("complement", { length: 120 }),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  consentTerms: boolean("consentTerms").default(false).notNull(),
  consentPrivacy: boolean("consentPrivacy").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
