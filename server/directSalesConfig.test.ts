import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context: TrpcContext = {
  user: null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("payments.directSalesStatus", () => {
  it("reports an enabled Pix checkout only after seller and delivery configuration", async () => {
    const status = await appRouter.createCaller(context).payments.directSalesStatus();
    expect(status.enabled).toBe(true);
    expect(status.seller).toMatchObject({
      legalName: expect.any(String),
      taxId: expect.any(String),
      supportEmail: expect.stringMatching(/@/),
      shippingEstimate: expect.any(String),
    });
    expect(status.seller?.legalName.trim().length).toBeGreaterThan(1);
    expect(status.seller?.taxId.trim().length).toBeGreaterThan(5);
    expect(status.seller?.shippingEstimate.trim().length).toBeGreaterThan(2);
  });
});
