import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  verifyPaymentSignature,
  verifySubscriptionSignature,
  PLANS,
  getPlanById,
} from "@/lib/razorpay";
import { z } from "zod";

export const runtime = "nodejs";

const VerifySchema = z.union([
  z.object({
    type: z.literal("subscription"),
    razorpay_payment_id: z.string(),
    razorpay_subscription_id: z.string(),
    razorpay_signature: z.string(),
    planId: z.string(),
    billing: z.enum(["monthly", "yearly"]),
  }),
  z.object({
    type: z.literal("order"),
    razorpay_payment_id: z.string(),
    razorpay_order_id: z.string(),
    razorpay_signature: z.string(),
    planId: z.string(),
    billing: z.enum(["monthly", "yearly"]),
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const params = VerifySchema.parse(body);

    let isValid = false;

    if (params.type === "subscription") {
      isValid = verifySubscriptionSignature({
        subscriptionId: params.razorpay_subscription_id,
        paymentId: params.razorpay_payment_id,
        signature: params.razorpay_signature,
      });
    } else {
      isValid = verifyPaymentSignature({
        orderId: params.razorpay_order_id,
        paymentId: params.razorpay_payment_id,
        signature: params.razorpay_signature,
      });
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed — invalid signature" },
        { status: 400 }
      );
    }

    // ── Activate subscription in DB ──────────────────────────────────────────
    // In production:
    // const plan = getPlanById(params.planId);
    // await db.user.update({
    //   where: { clerkId },
    //   data: {
    //     plan: params.planId.toUpperCase(),
    //     razorpaySubscriptionId: params.type === "subscription" ? params.razorpay_subscription_id : null,
    //     razorpayPaymentId: params.razorpay_payment_id,
    //     subscriptionStatus: "ACTIVE",
    //     subscriptionBilling: params.billing,
    //     subscriptionStartAt: new Date(),
    //     credits: plan.credits,
    //     maxCredits: plan.credits,
    //   }
    // });

    const plan = getPlanById(params.planId);

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        planId: params.planId,
        planName: plan.name,
        billing: params.billing,
        credits: plan.credits,
        paymentId: params.razorpay_payment_id,
        message: `Welcome to ${plan.name}! ${plan.credits} credits added.`,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? err.message }, { status: 400 });
    }
    console.error("[billing/verify]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
