import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, getPlanById, PLANS } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── EVENT HANDLERS ────────────────────────────────────────────────────────────

async function handleSubscriptionActivated(payload: any) {
  const { subscription, payment } = payload;
  const clerkUserId = subscription?.entity?.notes?.clerkUserId;
  const planId = subscription?.entity?.notes?.planId;

  if (!clerkUserId || !planId) {
    console.error("[webhook] Missing userId or planId in subscription notes");
    return;
  }

  const plan = getPlanById(planId);

  console.log(`[webhook] Subscription activated: user=${clerkUserId} plan=${planId}`);

  // Production: update DB
  // await db.user.update({
  //   where: { clerkId: clerkUserId },
  //   data: {
  //     plan: planId.toUpperCase(),
  //     subscriptionStatus: "ACTIVE",
  //     razorpaySubscriptionId: subscription.entity.id,
  //     credits: plan.credits,
  //     maxCredits: plan.credits,
  //     subscriptionStartAt: new Date(subscription.entity.current_start * 1000),
  //     subscriptionEndsAt: new Date(subscription.entity.current_end * 1000),
  //   }
  // });

  // await db.notification.create({
  //   data: {
  //     userId: clerkUserId,
  //     type: "PAYMENT_SUCCESS",
  //     title: `Welcome to ${plan.name}!`,
  //     body: `Your subscription is active. ${plan.credits} credits added to your account.`,
  //   }
  // });
}

async function handlePaymentCaptured(payload: any) {
  const { payment } = payload;
  const entity = payment?.entity;

  if (!entity) return;

  const clerkUserId = entity?.notes?.clerkUserId;
  const planId = entity?.notes?.planId;

  console.log(`[webhook] Payment captured: id=${entity.id} amount=${entity.amount} user=${clerkUserId}`);

  // Production: record invoice
  // await db.invoice.create({
  //   data: {
  //     userId: clerkUserId,
  //     razorpayPaymentId: entity.id,
  //     amount: entity.amount,
  //     currency: entity.currency,
  //     status: "PAID",
  //     method: entity.method,
  //     createdAt: new Date(entity.created_at * 1000),
  //   }
  // });
}

async function handlePaymentFailed(payload: any) {
  const { payment } = payload;
  const entity = payment?.entity;
  const clerkUserId = entity?.notes?.clerkUserId;

  console.error(`[webhook] Payment FAILED: id=${entity?.id} reason=${entity?.error_reason} user=${clerkUserId}`);

  // Production:
  // await db.user.update({ where: { clerkId: clerkUserId }, data: { subscriptionStatus: "PAST_DUE" } });
  // await sendEmail(entity.email, "paymentFailed", { reason: entity.error_description });
}

async function handleSubscriptionCancelled(payload: any) {
  const { subscription } = payload;
  const clerkUserId = subscription?.entity?.notes?.clerkUserId;

  console.log(`[webhook] Subscription cancelled: user=${clerkUserId}`);

  // Production:
  // await db.user.update({
  //   where: { clerkId: clerkUserId },
  //   data: { plan: "FREE", subscriptionStatus: "CANCELED", credits: 30, maxCredits: 30 }
  // });
}

async function handleSubscriptionCharged(payload: any) {
  const { subscription, payment } = payload;
  const clerkUserId = subscription?.entity?.notes?.clerkUserId;
  const planId = subscription?.entity?.notes?.planId;

  console.log(`[webhook] Subscription charged (renewal): user=${clerkUserId}`);

  if (!clerkUserId) return;

  const plan = getPlanById(planId ?? "creator_pro");

  // Production: reset monthly credits on renewal
  // await db.user.update({
  //   where: { clerkId: clerkUserId },
  //   data: {
  //     credits: plan.credits,
  //     subscriptionStatus: "ACTIVE",
  //     subscriptionEndsAt: new Date(subscription.entity.current_end * 1000),
  //   }
  // });
}

async function handleSubscriptionHalted(payload: any) {
  const { subscription } = payload;
  const clerkUserId = subscription?.entity?.notes?.clerkUserId;

  console.error(`[webhook] Subscription HALTED (max retries exceeded): user=${clerkUserId}`);

  // Production: downgrade to free after halted
  // await db.user.update({
  //   where: { clerkId: clerkUserId },
  //   data: { plan: "FREE", subscriptionStatus: "HALTED", credits: 30, maxCredits: 30 }
  // });
}

async function handleSubscriptionPending(payload: any) {
  // Subscription created, payment not yet charged (e.g. during trial)
  const { subscription } = payload;
  const clerkUserId = subscription?.entity?.notes?.clerkUserId;
  console.log(`[webhook] Subscription pending/trial: user=${clerkUserId}`);
}

async function handleRefundCreated(payload: any) {
  const { refund } = payload;
  console.log(`[webhook] Refund created: id=${refund?.entity?.id} amount=${refund?.entity?.amount}`);
}

// ── WEBHOOK HANDLER ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  // Verify signature
  let isValid = false;
  try {
    isValid = verifyWebhookSignature(body, signature);
  } catch {
    isValid = false;
  }

  // In development without a real secret, allow through with a warning
  if (!isValid && process.env.NODE_ENV === "production") {
    console.error("[webhook] SIGNATURE VERIFICATION FAILED — rejecting");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (!isValid) {
    console.warn("[webhook] Signature verification skipped (dev mode)");
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventType: string = event.event;
  const payload = event.payload;

  console.log(`[webhook] Received: ${eventType}`);

  try {
    switch (eventType) {
      // ── PAYMENTS ─────────────────────────────────────────────────────────
      case "payment.captured":
        await handlePaymentCaptured(payload);
        break;
      case "payment.failed":
        await handlePaymentFailed(payload);
        break;

      // ── SUBSCRIPTIONS ─────────────────────────────────────────────────────
      case "subscription.activated":
        await handleSubscriptionActivated(payload);
        break;
      case "subscription.charged":
        await handleSubscriptionCharged(payload);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(payload);
        break;
      case "subscription.halted":
        await handleSubscriptionHalted(payload);
        break;
      case "subscription.pending":
        await handleSubscriptionPending(payload);
        break;
      case "subscription.completed":
        console.log("[webhook] Subscription completed naturally");
        break;
      case "subscription.updated":
        console.log("[webhook] Subscription plan updated");
        break;

      // ── REFUNDS ───────────────────────────────────────────────────────────
      case "refund.created":
        await handleRefundCreated(payload);
        break;
      case "refund.processed":
        console.log("[webhook] Refund processed");
        break;

      // ── INVOICES ──────────────────────────────────────────────────────────
      case "invoice.paid":
        console.log("[webhook] Invoice paid");
        break;

      default:
        console.log(`[webhook] Unhandled event: ${eventType}`);
    }
  } catch (err) {
    // Never return 5xx to Razorpay — it will retry endlessly
    console.error(`[webhook] Handler error for ${eventType}:`, err);
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true, event: eventType });
}
