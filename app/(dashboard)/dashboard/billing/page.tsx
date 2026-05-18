
"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Zap, Check, Shield, AlertCircle,
  Download, ExternalLink, X, Tag, Clock, Award
} from "lucide-react";
import { Button, Card, Badge, Progress, Modal, Input } from "@/components/ui";
import { PLANS, formatINR, applyCoupon } from "@/lib/razorpay";
import type { PlanId } from "@/lib/razorpay";
import { cn } from "@/lib/utils";

declare global { interface Window { Razorpay: any; } }
type BillingCycle = "monthly" | "yearly";

const MOCK_INVOICES = [
  { id: "pay_QA1234", date: "May 1 2025", amount: 499900, plan: "Creator Studio", status: "paid", method: "UPI" },
  { id: "pay_QA5678", date: "Apr 1 2025", amount: 499900, plan: "Creator Studio", status: "paid", method: "Card" },
  { id: "pay_QA9012", date: "Mar 1 2025", amount: 499900, plan: "Creator Studio", status: "paid", method: "Net Banking" },
];

function PlanCard({ plan, cycle, current, onSelect }: { plan: any; cycle: BillingCycle; current: boolean; onSelect: () => void; }) {
  const price = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const saving = cycle === "yearly" && plan.monthlyPrice > 0
    ? Math.round(((plan.monthlyPrice - plan.yearlyPrice) / plan.monthlyPrice) * 100) : 0;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="relative h-full">
      {plan.badge && (
        <div className="absolute -top-3 inset-x-0 flex justify-center z-10">
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white rounded-full" style={{ background: plan.color }}>{plan.badge}</span>
        </div>
      )}
      <div className={cn("h-full flex flex-col rounded-2xl border p-7 transition-all duration-300", plan.highlight ? "border-brand/40 bg-brand/5 shadow-brand-sm" : "border-surface-border bg-canvas-50 hover:border-surface-border-strong", current && !plan.highlight && "border-accent-teal/30 bg-accent-teal/4")}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: plan.color }}>{plan.name}</p>
            {current && <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-teal/12 border border-accent-teal/25"><span className="w-1.5 h-1.5 rounded-full bg-accent-teal" /><span className="text-[9px] font-bold text-accent-teal uppercase tracking-widest">Active</span></div>}
          </div>
          <p className="text-xs text-ink-tertiary mb-4">{plan.tagline}</p>
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-bold text-ink-DEFAULT">{plan.monthlyPrice === 0 ? "Free" : formatINR(price)}</span>
              {plan.monthlyPrice > 0 && <span className="text-ink-tertiary text-sm">/mo</span>}
            </div>
            {cycle === "yearly" && saving > 0 && <p className="text-xs text-accent-teal font-semibold">Save {saving}% vs monthly</p>}
            {plan.trialDays > 0 && !current && <p className="text-xs text-accent-amber font-semibold">✦ {plan.trialDays}-day free trial</p>}
          </div>
        </div>
        <ul className="flex-1 space-y-2.5 mb-7">
          {plan.features.map((f: string) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-ink-secondary"><Check className="w-3.5 h-3.5 text-accent-teal flex-shrink-0 mt-0.5" />{f}</li>
          ))}
        </ul>
        {plan.monthlyPrice === 0
          ? <div className="text-center py-2.5 text-sm text-ink-tertiary border border-dashed border-surface-border rounded-xl">{current ? "Your current plan" : "Always free"}</div>
          : <button onClick={onSelect} disabled={current} className={cn("w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200", current ? "bg-surface-DEFAULT text-ink-tertiary cursor-default" : plan.highlight ? "bg-brand text-white shadow-brand-sm hover:shadow-brand-md" : "border border-surface-border text-ink-secondary hover:text-ink-DEFAULT hover:border-surface-border-strong")} style={!current && !plan.highlight ? { borderColor: `${plan.color}30`, color: plan.color } : undefined}>
            {current ? "Current Plan" : plan.trialDays > 0 ? `Start ${plan.trialDays}-day trial` : `Upgrade to ${plan.name}`}
          </button>
        }
      </div>
    </motion.div>
  );
}

function CheckoutModal({ plan, cycle, onClose, onSuccess }: { plan: any; cycle: BillingCycle; onClose: () => void; onSuccess: (d: any) => void; }) {
  const [step, setStep] = useState<"details"|"processing"|"success">("details");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [coupon, setCoupon] = useState(""); const [couponApplied, setCouponApplied] = useState<any>(null); const [couponError, setCouponError] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const basePrice = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const finalPrice = couponApplied?.valid ? couponApplied.finalAmount : basePrice;

  function handleApplyCoupon() {
    setCouponError("");
    const result = applyCoupon(basePrice, coupon.trim());
    if (result.valid) setCouponApplied(result); else { setCouponError("Invalid coupon code"); setCouponApplied(null); }
  }

  async function handleCheckout() {
    if (!name.trim() || !email.trim()) { setError("Name and email are required"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/billing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId: plan.id, billing: cycle, name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, couponCode: couponApplied?.valid ? coupon.trim() : undefined }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Failed");
      const cd = data.data;
      setLoading(false);
      const rzpOptions = {
        key: cd.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: cd.amount, currency: "INR",
        name: "ViralForge AI", description: `${plan.name} Subscription`,
        ...(cd.type === "subscription" && { subscription_id: cd.subscriptionId, recurring: true }),
        ...(cd.type === "order" && { order_id: cd.orderId }),
        handler: async (response: any) => {
          setStep("processing");
          const verifyRes = await fetch("/api/billing/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: cd.type, ...(cd.type === "subscription" ? { razorpay_subscription_id: response.razorpay_subscription_id } : { razorpay_order_id: response.razorpay_order_id }), razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, planId: plan.id, billing: cycle }) });
          const vd = await verifyRes.json();
          if (vd.success) { setStep("success"); setTimeout(() => onSuccess(vd.data), 1500); }
          else { setError(vd.error ?? "Verification failed"); setStep("details"); }
        },
        prefill: cd.prefill,
        theme: { color: "#6E42F5" },
        modal: { confirm_close: true },
      };
      const rzp = new window.Razorpay(rzpOptions);
      rzp.on("payment.failed", (r: any) => setError(`Payment failed: ${r.error.description}`));
      rzp.open();
    } catch (err: any) { setError(err.message); setLoading(false); }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Modal open onClose={onClose} title="" size="sm">
        <AnimatePresence mode="wait">
          {step === "success" ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent-teal/15 border border-accent-teal/30 flex items-center justify-center mx-auto"><Check className="w-8 h-8 text-accent-teal" /></div>
              <div><h3 className="font-display text-2xl font-bold mb-1">You're on {plan.name}!</h3><p className="text-ink-secondary text-sm">Your credits have been added.</p></div>
            </motion.div>
          ) : step === "processing" ? (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 space-y-4">
              <div className="w-12 h-12 border-2 border-brand/30 border-t-brand rounded-full animate-spin mx-auto" />
              <p className="font-semibold">Verifying payment…</p>
            </motion.div>
          ) : (
            <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: `${plan.color}08`, borderColor: `${plan.color}25` }}>
                <div><p className="font-display font-bold" style={{ color: plan.color }}>{plan.name}</p><p className="text-xs text-ink-tertiary mt-0.5 capitalize">{cycle} subscription</p></div>
                <div className="text-right"><p className="font-display text-2xl font-bold">{formatINR(finalPrice)}</p><p className="text-xs text-ink-tertiary">/month</p></div>
              </div>
              {error && <div className="flex items-start gap-2.5 p-3 rounded-xl bg-accent-rose/8 border border-accent-rose/25"><AlertCircle className="w-4 h-4 text-accent-rose flex-shrink-0 mt-0.5" /><p className="text-sm text-accent-rose">{error}</p></div>}
              <div className="space-y-3">
                <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" fullWidth />
                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" fullWidth />
                <Input label="Phone (optional)" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" fullWidth />
              </div>
              <div>
                <div className="flex gap-2">
                  <Input prefixIcon={<Tag className="w-3.5 h-3.5" />} value={coupon} onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); setCouponApplied(null); }} placeholder="Coupon code" className="flex-1" error={couponError} />
                  <Button variant="secondary" size="sm" onClick={handleApplyCoupon} className="flex-shrink-0">Apply</Button>
                </div>
                {couponApplied?.valid && <p className="text-xs text-accent-teal mt-1.5 font-semibold">✓ {couponApplied.description} — you save {formatINR(couponApplied.savings)}</p>}
              </div>
              <div className="flex items-center justify-center gap-5 py-2">
                {[{icon: Shield, label: "256-bit SSL"}, {icon: Clock, label: "Cancel anytime"}, {icon: Award, label: "7-day refund"}].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-ink-tertiary"><item.icon className="w-3 h-3" />{item.label}</div>
                ))}
              </div>
              <Button onClick={handleCheckout} loading={loading} glow className="w-full" size="lg">
                <Zap className="w-4 h-4" />{plan.trialDays > 0 ? `Start ${plan.trialDays}-day free trial` : `Pay ${formatINR(finalPrice)}/month`}
              </Button>
              <div className="text-center">
                <p className="text-[11px] text-ink-disabled mb-2">Supports</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {["UPI", "Cards", "Net Banking", "Wallets", "EMI"].map(m => (
                    <span key={m} className="text-[10px] px-2 py-1 rounded-md bg-surface-DEFAULT border border-surface-border text-ink-tertiary">{m}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </>
  );
}

export default function BillingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [successPlan, setSuccessPlan] = useState<any>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const currentPlanId: PlanId = "creator_studio";
  const currentPlan = PLANS[currentPlanId];
  const credits = 840; const maxCredits = 1000;
  const planOrder: PlanId[] = ["free", "creator_pro", "creator_studio", "enterprise"];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <AnimatePresence>
        {successPlan && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 right-6 z-50 max-w-sm">
            <div className="flex items-center gap-3 p-4 bg-canvas-100 border border-accent-teal/30 rounded-2xl shadow-surface-lg">
              <div className="w-10 h-10 rounded-full bg-accent-teal/15 flex items-center justify-center flex-shrink-0"><Check className="w-5 h-5 text-accent-teal" /></div>
              <div className="flex-1"><p className="text-sm font-semibold">Welcome to {successPlan.planName}!</p><p className="text-xs text-ink-tertiary mt-0.5">{successPlan.credits} credits added</p></div>
              <button onClick={() => setSuccessPlan(null)} className="text-ink-tertiary hover:text-ink-DEFAULT"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between">
        <div><h1 className="font-display text-3xl font-extrabold tracking-tight mb-1">Billing & Plans</h1><p className="text-ink-secondary text-sm">Manage your subscription and payment history.</p></div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-DEFAULT border border-surface-border text-xs text-ink-tertiary"><Shield className="w-3.5 h-3.5" />Secured by Razorpay</div>
      </div>

      {/* Current subscription */}
      <Card style={{ borderColor: `${currentPlan.color}30` }} glow="brand">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: currentPlan.color }}>{currentPlan.name}</p>
              <Badge variant="success" dot>Active</Badge><Badge variant="brand">Yearly</Badge>
            </div>
            <p className="font-display text-3xl font-extrabold mb-1">{formatINR(currentPlan.yearlyPrice)}<span className="text-base font-normal text-ink-tertiary">/mo</span></p>
            <p className="text-xs text-ink-tertiary">Next billing: June 1, 2025</p>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2"><span className="text-ink-secondary font-medium">Credits used</span><span className="font-bold" style={{ color: currentPlan.color }}>{credits}/{maxCredits}</span></div>
            <Progress value={credits} max={maxCredits} variant="brand" />
            <p className="text-[11px] text-ink-tertiary mt-1.5">Resets on next billing date</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Button variant="secondary" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />} className="w-full">Manage in Razorpay</Button>
            <button onClick={() => setCancelConfirm(true)} className="text-xs text-ink-tertiary hover:text-accent-rose transition-colors">Cancel subscription</button>
          </div>
        </div>
      </Card>

      {/* Cycle toggle */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-1 p-1 bg-canvas-100 border border-surface-border rounded-xl">
          {(["monthly", "yearly"] as const).map(c => (
            <button key={c} onClick={() => setCycle(c)} className={cn("relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize", cycle === c ? "bg-brand text-white shadow-brand-sm" : "text-ink-tertiary hover:text-ink-DEFAULT")}>
              {c}{c === "yearly" && <span className="absolute -top-2.5 -right-2 bg-accent-teal text-canvas text-[9px] font-bold px-1.5 py-0.5 rounded-full">−30%</span>}
            </button>
          ))}
        </div>
        {cycle === "yearly" && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-accent-teal font-semibold">✦ Annual plans save up to ₹24,000/year</motion.p>}
      </div>

      {/* Plan grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {planOrder.map(id => <PlanCard key={id} plan={PLANS[id]} cycle={cycle} current={id === currentPlanId} onSelect={() => setCheckoutPlan(PLANS[id])} />)}
      </div>

      {/* Invoice history */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h3 className="font-display font-bold text-base">Payment History</h3>
          <Button variant="ghost" size="sm">View all</Button>
        </div>
        {MOCK_INVOICES.map((inv, i) => (
          <div key={inv.id} className={cn("flex items-center justify-between px-6 py-4 hover:bg-surface-DEFAULT transition-colors", i < MOCK_INVOICES.length - 1 && "border-b border-surface-border")}>
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-surface-DEFAULT border border-surface-border flex items-center justify-center"><CreditCard className="w-4 h-4 text-ink-tertiary" /></div>
              <div><p className="text-sm font-semibold">{inv.plan}</p><p className="text-xs text-ink-tertiary">{inv.date} · {inv.method}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm font-bold">{formatINR(inv.amount)}</p>
              <Badge variant="success">{inv.status}</Badge>
              <button className="text-ink-tertiary hover:text-ink-DEFAULT transition-colors"><Download className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </Card>

      {/* Cancel modal */}
      <Modal open={cancelConfirm} onClose={() => setCancelConfirm(false)} title="Cancel Subscription" size="sm">
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-rose/8 border border-accent-rose/20">
            <AlertCircle className="w-5 h-5 text-accent-rose flex-shrink-0 mt-0.5" />
            <div><p className="text-sm font-semibold text-accent-rose mb-1">Before you cancel</p><p className="text-xs text-ink-secondary leading-relaxed">You'll keep full access until <strong>June 1, 2025</strong>. After that you'll be downgraded to Free.</p></div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setCancelConfirm(false)}>Keep my plan</Button>
            <Button variant="danger" className="flex-1" onClick={() => setCancelConfirm(false)}>Cancel anyway</Button>
          </div>
        </div>
      </Modal>

      {checkoutPlan && <CheckoutModal plan={checkoutPlan} cycle={cycle} onClose={() => setCheckoutPlan(null)} onSuccess={d => { setSuccessPlan(d); setCheckoutPlan(null); }} />}
    </div>
  );
}
