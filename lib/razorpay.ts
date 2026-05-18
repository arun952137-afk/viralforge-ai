import Razorpay from "razorpay";
import crypto from "crypto";

// ── SINGLETON CLIENT ──────────────────────────────────────────────────────────
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ── PLAN DEFINITIONS ──────────────────────────────────────────────────────────
export type PlanId = "free" | "creator_pro" | "creator_studio" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;          // INR paise (e.g. 149900 = ₹1499)
  yearlyPrice: number;           // INR paise per month billed yearly
  monthlyPriceUSD: number;       // display
  yearlyPriceUSD: number;        // display
  credits: number;
  maxVideosPerDay: number;       // -1 = unlimited
  maxResolution: "720p" | "1080p" | "4K";
  razorpayPlanIdMonthly: string | null;
  razorpayPlanIdYearly: string | null;
  features: string[];
  notIncluded: string[];
  highlight: boolean;
  badge?: string;
  color: string;
  trialDays: number;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Start exploring",
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceUSD: 0,
    yearlyPriceUSD: 0,
    credits: 30,
    maxVideosPerDay: 3,
    maxResolution: "720p",
    razorpayPlanIdMonthly: null,
    razorpayPlanIdYearly: null,
    features: [
      "3 videos/day",
      "720p export",
      "Basic AI script writer",
      "5 voice presets",
      "Watermarked exports",
      "Community support",
    ],
    notIncluded: ["Hook Lab", "Trend Radar", "Voice cloning", "4K export", "Auto-publish"],
    highlight: false,
    color: "#4A4A64",
    trialDays: 0,
  },

  creator_pro: {
    id: "creator_pro",
    name: "Creator Pro",
    tagline: "For serious creators",
    monthlyPrice: 299900,       // ₹2,999/mo
    yearlyPrice: 199900,        // ₹1,999/mo billed yearly
    monthlyPriceUSD: 36,
    yearlyPriceUSD: 24,
    credits: 300,
    maxVideosPerDay: 15,
    maxResolution: "1080p",
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY ?? "plan_pro_monthly",
    razorpayPlanIdYearly: process.env.RAZORPAY_PLAN_PRO_YEARLY ?? "plan_pro_yearly",
    features: [
      "15 videos/day",
      "Full HD 1080p export",
      "Advanced AI scripts",
      "25 voice presets",
      "No watermark",
      "Trend Radar",
      "Hook Lab",
      "Priority rendering",
      "Email support",
    ],
    notIncluded: ["Voice cloning", "4K export", "Team seats", "API access"],
    highlight: false,
    color: "#42B4F5",
    trialDays: 7,
  },

  creator_studio: {
    id: "creator_studio",
    name: "Creator Studio",
    tagline: "For creators who scale",
    monthlyPrice: 699900,       // ₹6,999/mo
    yearlyPrice: 499900,        // ₹4,999/mo billed yearly
    monthlyPriceUSD: 84,
    yearlyPriceUSD: 60,
    credits: 1000,
    maxVideosPerDay: -1,
    maxResolution: "4K",
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_STUDIO_MONTHLY ?? "plan_studio_monthly",
    razorpayPlanIdYearly: process.env.RAZORPAY_PLAN_STUDIO_YEARLY ?? "plan_studio_yearly",
    features: [
      "Unlimited videos",
      "4K export",
      "Voice cloning",
      "Auto-publish all platforms",
      "Timeline video editor",
      "AI B-roll insertion",
      "Repurpose Studio",
      "AI Brand Memory",
      "Viral Intelligence scoring",
      "Creator analytics",
      "Priority support",
    ],
    notIncluded: ["Team seats (>1)", "White-label", "API access"],
    highlight: true,
    badge: "Most Popular",
    color: "#6E42F5",
    trialDays: 7,
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For teams & agencies",
    monthlyPrice: 2499900,      // ₹24,999/mo
    yearlyPrice: 1999900,       // ₹19,999/mo billed yearly
    monthlyPriceUSD: 299,
    yearlyPriceUSD: 239,
    credits: 5000,
    maxVideosPerDay: -1,
    maxResolution: "4K",
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_ENT_MONTHLY ?? "plan_enterprise_monthly",
    razorpayPlanIdYearly: process.env.RAZORPAY_PLAN_ENT_YEARLY ?? "plan_enterprise_yearly",
    features: [
      "Everything in Studio",
      "10 team seats",
      "Client dashboards",
      "White-label exports",
      "API access",
      "Custom AI brand training",
      "Dedicated account manager",
      "SLA guarantee",
      "Priority queue (GPU)",
      "Custom integrations",
    ],
    notIncluded: [],
    highlight: false,
    color: "#0DCCB5",
    trialDays: 14,
  },
};

export function getPlanById(id: string): Plan {
  return PLANS[id as PlanId] ?? PLANS.free;
}

export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

// ── CUSTOMER API ──────────────────────────────────────────────────────────────
export async function createRazorpayCustomer(params: {
  name: string;
  email: string;
  contact?: string;
  userId: string;
}) {
  return (razorpay.customers as any).create({
    name: params.name,
    email: params.email,
    contact: params.contact ?? "",
    notes: { userId: params.userId },
    fail_existing: "0",
  }) as unknown as Promise<any>;
}

// ── SUBSCRIPTION API ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createSubscription(params: {
  planId: string;
  customerId: string;
  totalCount?: number;   // billing cycles; 0 = until cancel
  quantity?: number;
  trialDays?: number;
  addons?: Array<{ item: { name: string; amount: number; currency: string; unit_amount: number } }>;
  notes?: Record<string, string>;
}) {
  const startAt = params.trialDays && params.trialDays > 0
    ? Math.floor(Date.now() / 1000) + params.trialDays * 86400
    : undefined;

  return (razorpay.subscriptions as any).create({
    plan_id: params.planId,
    customer_notify: 1,
    quantity: params.quantity ?? 1,
    total_count: params.totalCount ?? 120, // 10 years
    customer_id: params.customerId,
    ...(startAt && { start_at: startAt }),
    ...(params.addons && { addons: params.addons }),
    notes: params.notes ?? {},
  }) as unknown as Promise<any>;
}

export async function cancelSubscription(subscriptionId: string, cancelAtCycleEnd = true) {
  return (razorpay.subscriptions as any).cancel(subscriptionId, cancelAtCycleEnd);
}

export async function fetchSubscription(subscriptionId: string) {
  return (razorpay.subscriptions as any).fetch(subscriptionId);
}

// ── PAYMENT ORDER (one-time) ───────────────────────────────────────────────────
export async function createOrder(params: {
  amount: number;   // paise
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  return (razorpay.orders as any).create({
    amount: params.amount,
    currency: params.currency ?? "INR",
    receipt: params.receipt,
    notes: params.notes ?? {},
  }) as unknown as Promise<any>;
}

// ── WEBHOOK VERIFICATION ─────────────────────────────────────────────────────
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(signature, "hex")
  );
}

// ── PAYMENT SIGNATURE VERIFICATION (client checkout) ─────────────────────────
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const payload = `${params.orderId}|${params.paymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(payload)
    .digest("hex");
  return expected === params.signature;
}

export function verifySubscriptionSignature(params: {
  subscriptionId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const payload = `${params.paymentId}|${params.subscriptionId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(payload)
    .digest("hex");
  return expected === params.signature;
}

// ── INVOICE FETCH ─────────────────────────────────────────────────────────────
export async function fetchInvoicesForSubscription(subscriptionId: string) {
  // Razorpay doesn't have a direct subscription→invoices API;
  // we fetch payments filtered by subscription_id
  const payments: any = await (razorpay.payments as any).all({
    from: Math.floor(Date.now() / 1000) - 365 * 86400,
    to: Math.floor(Date.now() / 1000),
    count: 100,
  } as any);
  return (payments.items as any[]).filter(
    (p: any) => p.subscription_id === subscriptionId
  );
}

// ── COUPON / OFFER VALIDATION ─────────────────────────────────────────────────
export const COUPONS: Record<string, { discount: number; type: "percent" | "fixed"; description: string }> = {
  CREATOR50: { discount: 50, type: "percent", description: "50% off for creators" },
  LAUNCH25: { discount: 25, type: "percent", description: "Launch week special — 25% off" },
  ANNUAL20: { discount: 20, type: "percent", description: "Extra 20% off annual plans" },
  FRIEND500: { discount: 50000, type: "fixed", description: "₹500 off — referral discount" },
};

export function applyCoupon(amount: number, code: string): { finalAmount: number; savings: number; valid: boolean; description: string } {
  const coupon = COUPONS[code.toUpperCase()];
  if (!coupon) return { finalAmount: amount, savings: 0, valid: false, description: "" };
  const savings = coupon.type === "percent"
    ? Math.floor(amount * coupon.discount / 100)
    : Math.min(coupon.discount, amount);
  return { finalAmount: amount - savings, savings, valid: true, description: coupon.description };
}
