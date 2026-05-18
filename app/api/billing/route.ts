import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  razorpay,
  PLANS,
  createRazorpayCustomer,
  createSubscription,
  createOrder,
  applyCoupon,
  formatINR,
  getPlanById,
} from "@/lib/razorpay";
import { z } from "zod";

export const runtime = "nodejs";

// ── POST /api/billing ─────────────────────────────────────────────────────────
// Creates a Razorpay subscription or order for checkout
const CheckoutSchema = z.object({
  planId: z.enum(["creator_pro", "creator_studio", "enterprise"]),
  billing: z.enum(["monthly", "yearly"]),
  couponCode: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const params = CheckoutSchema.parse(body);

    const plan = PLANS[params.planId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Determine price
    const baseAmount = params.billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

    // Apply coupon
    let finalAmount = baseAmount;
    let couponResult = null;
    if (params.couponCode) {
      const result = applyCoupon(baseAmount, params.couponCode);
      if (result.valid) {
        finalAmount = result.finalAmount;
        couponResult = result;
      }
    }

    // Determine Razorpay plan ID for subscription
    const razorpayPlanId = params.billing === "yearly"
      ? plan.razorpayPlanIdYearly
      : plan.razorpayPlanIdMonthly;

    // Create Razorpay customer
    const customer: any = await createRazorpayCustomer({
      name: params.name,
      email: params.email,
      contact: params.phone,
      userId: clerkId,
    });

    let checkoutData: Record<string, any>;

    if (razorpayPlanId) {
      // Subscription flow
      const subscription: any = await createSubscription({
        planId: razorpayPlanId,
        customerId: customer.id,
        trialDays: plan.trialDays,
        totalCount: params.billing === "yearly" ? 12 : 120,
        notes: {
          clerkUserId: clerkId,
          planId: params.planId,
          billing: params.billing,
          coupon: params.couponCode ?? "",
        },
      });

      checkoutData = {
        type: "subscription",
        subscriptionId: subscription.id,
        customerId: customer.id,
        planId: params.planId,
        billing: params.billing,
        amount: finalAmount,
        currency: "INR",
        trialDays: plan.trialDays,
        coupon: couponResult,
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        prefill: {
          name: params.name,
          email: params.email,
          contact: params.phone ?? "",
        },
      };
    } else {
      // Fallback: one-time order (for custom plans / no plan ID configured yet)
      const order: any = await createOrder({
        amount: finalAmount,
        receipt: `vf_${clerkId}_${Date.now()}`,
        notes: {
          clerkUserId: clerkId,
          planId: params.planId,
          billing: params.billing,
        },
      });

      checkoutData = {
        type: "order",
        orderId: order.id,
        customerId: customer.id,
        planId: params.planId,
        billing: params.billing,
        amount: finalAmount,
        currency: "INR",
        coupon: couponResult,
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        prefill: {
          name: params.name,
          email: params.email,
          contact: params.phone ?? "",
        },
      };
    }

    return NextResponse.json({ success: true, data: checkoutData });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? err.message }, { status: 400 });
    }
    console.error("[billing POST]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

// ── GET /api/billing ──────────────────────────────────────────────────────────
// Returns current subscription details for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // In production this reads from your DB — for now returns mock structure
    // db.user.findUnique({ where: { clerkId } }) → check subscription fields
    return NextResponse.json({
      success: true,
      data: {
        plan: "free",
        subscriptionId: null,
        status: "inactive",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        credits: 30,
        maxCredits: 30,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch billing info" }, { status: 500 });
  }
}

// ── PATCH /api/billing ────────────────────────────────────────────────────────
// Cancel subscription
export async function PATCH(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { action, subscriptionId } = await req.json();

    if (action === "cancel" && subscriptionId) {
      const { cancelSubscription } = await import("@/lib/razorpay");
      await cancelSubscription(subscriptionId, true); // cancel at period end
      return NextResponse.json({ success: true, data: { canceledAtPeriodEnd: true } });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[billing PATCH]", err);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}
