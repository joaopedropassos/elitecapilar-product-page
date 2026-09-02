import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertOrder, InsertUser, orders, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(orders).values(order);
  const [created] = await db.select().from(orders).where(eq(orders.orderNumber, order.orderNumber)).limit(1);
  if (!created) throw new Error("Não foi possível registrar o pedido");
  return created;
}

export async function attachPaymentToOrder(orderNumber: string, paymentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(orders).set({ paymentId, status: "awaiting_payment" }).where(eq(orders.orderNumber, orderNumber));
}

export async function updateOrderPaymentStatus(externalReference: string, status: InsertOrder["status"], paymentId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(orders).set({ status, ...(paymentId ? { paymentId } : {}) }).where(eq(orders.externalReference, externalReference));
}

export async function getOrderStatus(orderNumber: string, email: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const [order] = await db.select({
    orderNumber: orders.orderNumber,
    status: orders.status,
    productTitle: orders.productTitle,
    totalCents: orders.totalCents,
    createdAt: orders.createdAt,
  }).from(orders).where(and(eq(orders.orderNumber, orderNumber), eq(orders.customerEmail, email))).limit(1);
  return order ?? null;
}

export async function getOrderByExternalReference(externalReference: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const [order] = await db.select().from(orders).where(eq(orders.externalReference, externalReference)).limit(1);
  return order ?? null;
}

export async function listOrders(limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(Math.max(1, Math.min(limit, 200)));
}

export async function updateOrderFulfillment(input: {
  orderNumber: string;
  status: "paid" | "processing" | "shipped" | "delivered" | "canceled" | "refunded";
  supplierOrderReference?: string | null;
  trackingCode?: string | null;
  trackingUrl?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(orders).set({
    status: input.status,
    supplierOrderReference: input.supplierOrderReference || null,
    trackingCode: input.trackingCode || null,
    trackingUrl: input.trackingUrl || null,
  }).where(eq(orders.orderNumber, input.orderNumber));
  const [updated] = await db.select().from(orders).where(eq(orders.orderNumber, input.orderNumber)).limit(1);
  if (!updated) throw new Error("Pedido não encontrado");
  return updated;
}
