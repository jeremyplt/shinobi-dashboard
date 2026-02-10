import { NextResponse } from "next/server";
import { runQuery } from "@/lib/data/firebase-admin";
import { cached } from "@/lib/data/cache";

export const dynamic = "force-dynamic";

interface PlanData {
  name: string;
  subscribers: number;
  revenue: number; // USD cents
  type: "monthly" | "yearly" | "lifetime" | "trial";
}

function categorizePlan(productId: string): { name: string; type: PlanData["type"] } {
  const id = productId.toLowerCase();
  if (id.includes("lifetime")) return { name: "Lifetime", type: "lifetime" };
  if (id.includes("yearly") || id.includes("annual")) return { name: "Yearly", type: "yearly" };
  if (id.includes("monthly")) return { name: "Monthly", type: "monthly" };
  if (id.includes("welcome")) return { name: "Welcome Yearly", type: "yearly" };
  if (id.includes("trial")) return { name: "Trial", type: "trial" };
  return { name: productId, type: "monthly" };
}

export async function GET() {
  try {
    const data = await cached("plan-breakdown", async () => {
      // Fetch recent events (last 90 days) to calculate active plan distribution
      const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

      const docs = await runQuery({
        collection: "revenuecat_events",
        where: [
          {
            field: "event_timestamp_ms",
            op: "GREATER_THAN_OR_EQUAL" as const,
            value: { integerValue: String(ninetyDaysAgo) },
          },
        ],
        select: [
          "type",
          "product_id",
          "price_in_purchased_currency",
          "currency",
          "event_timestamp_ms",
        ],
        limit: 50000,
      });

      // Aggregate by product category
      const planMap = new Map<string, PlanData>();

      for (const doc of docs) {
        const eventType = doc.type as string;
        const productId = (doc.product_id as string) || "";
        const price = (doc.price_in_purchased_currency as number) || 0;

        // Only count active subscription events
        if (!["INITIAL_PURCHASE", "RENEWAL", "NON_RENEWING_PURCHASE"].includes(eventType)) {
          continue;
        }

        const { name, type } = categorizePlan(productId);

        if (!planMap.has(type)) {
          planMap.set(type, { name, subscribers: 0, revenue: 0, type });
        }

        const plan = planMap.get(type)!;
        plan.subscribers++;
        plan.revenue += Math.round(price * 100); // rough USD cents
      }

      return Array.from(planMap.values()).sort((a, b) => b.revenue - a.revenue);
    }, 60 * 60 * 1000); // cache 1h

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Plan breakdown error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed", data: [] },
      { status: 500 }
    );
  }
}
