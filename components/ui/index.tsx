"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2, X, Check, ChevronDown, AlertCircle } from "lucide-react";

/* ─────────────────────────────────────────────
   BUTTON
───────────────────────────────────────────── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brand" | "secondary" | "ghost" | "danger" | "outline" | "teal";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  glow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "brand", size = "md", loading, icon, iconRight, glow, children, className, disabled, ...props }, ref) => {
    const base = "relative inline-flex items-center justify-center gap-2.5 font-semibold rounded-xl transition-all duration-200 select-none overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants: Record<string, string> = {
      brand: "bg-brand text-white hover:bg-brand-light shadow-brand-sm hover:shadow-brand-md",
      secondary: "bg-surface-DEFAULT text-ink-secondary border border-surface-border hover:bg-surface-hover hover:text-ink-DEFAULT hover:border-surface-border-strong",
      ghost: "text-ink-tertiary hover:text-ink-DEFAULT hover:bg-surface-DEFAULT",
      danger: "bg-accent-rose/15 text-accent-rose border border-accent-rose/30 hover:bg-accent-rose/25",
      outline: "border border-brand/40 text-brand hover:bg-brand/10 hover:border-brand/60",
      teal: "bg-accent-teal/15 text-accent-teal border border-accent-teal/30 hover:bg-accent-teal/25",
    };

    const sizes: Record<string, string> = {
      xs: "text-xs px-2.5 py-1.5 rounded-lg",
      sm: "text-sm px-3.5 py-2 rounded-xl",
      md: "text-sm px-5 py-2.5",
      lg: "text-base px-7 py-3.5",
      xl: "text-lg px-9 py-4 rounded-2xl",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], glow && "shadow-brand-md", className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
        {iconRight && !loading && iconRight}
      </button>
    );
  }
);
Button.displayName = "Button";

/* ─────────────────────────────────────────────
   CARD
───────────────────────────────────────────── */
export function Card({
  children, className, hover, glow, glass, padding = true, style,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "brand" | "teal" | "rose";
  glass?: boolean;
  padding?: boolean;
  style?: React.CSSProperties;
}) {
  const glows = {
    brand: "shadow-brand-sm",
    teal: "glow-teal",
    rose: "glow-rose",
  };

  return (
    <div style={style} className={cn(
      "rounded-2xl border border-surface-border",
      glass ? "glass" : "bg-canvas-50",
      padding && "p-6",
      hover && "transition-all duration-200 hover:-translate-y-0.5 hover:border-surface-border-strong",
      glow && glows[glow],
      className
    )}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   INPUT
───────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixIcon?: React.ReactNode;
  suffix?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefixIcon, suffix, fullWidth, className, ...props }, ref) => (
    <div className={cn("space-y-1.5", fullWidth && "w-full")}>
      {label && (
        <label className="block text-xs font-semibold text-ink-tertiary uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixIcon && (
          <div className="absolute left-3.5 text-ink-tertiary flex-shrink-0 pointer-events-none">
            {prefixIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-canvas-100 border border-surface-border rounded-xl px-4 py-2.5 text-sm text-ink-DEFAULT",
            "placeholder:text-ink-disabled outline-none",
            "focus:border-brand/50 focus:ring-2 focus:ring-brand/15",
            "transition-all duration-200",
            prefixIcon && "pl-10",
            suffix && "pr-10",
            error && "border-accent-rose/60 focus:border-accent-rose/60 focus:ring-accent-rose/15",
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3.5 text-ink-tertiary">{suffix}</div>
        )}
      </div>
      {error && <p className="text-xs text-accent-rose flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
      {hint && !error && <p className="text-xs text-ink-tertiary">{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";

/* ─────────────────────────────────────────────
   TEXTAREA
───────────────────────────────────────────── */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }
>(({ label, error, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-semibold text-ink-tertiary uppercase tracking-wider">{label}</label>}
    <textarea
      ref={ref}
      className={cn(
        "w-full bg-canvas-100 border border-surface-border rounded-xl px-4 py-3 text-sm text-ink-DEFAULT",
        "placeholder:text-ink-disabled outline-none resize-none",
        "focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition-all duration-200",
        error && "border-accent-rose/60",
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-accent-rose">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";

/* ─────────────────────────────────────────────
   SELECT
───────────────────────────────────────────── */
export function Select({
  label, value, onChange, options, className,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="block text-xs font-semibold text-ink-tertiary uppercase tracking-wider">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-canvas-100 border border-surface-border rounded-xl px-4 py-2.5 pr-10 text-sm text-ink-DEFAULT outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition-all cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-canvas-50">{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BADGE
───────────────────────────────────────────── */
type BadgeVariant = "default" | "brand" | "success" | "warning" | "danger" | "teal" | "sky";

export function Badge({
  children, variant = "default", dot, className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-surface-DEFAULT text-ink-tertiary border-surface-border",
    brand: "bg-brand/15 text-brand-light border-brand/25",
    success: "bg-accent-teal/12 text-accent-teal border-accent-teal/25",
    warning: "bg-accent-amber/12 text-accent-amber border-accent-amber/25",
    danger: "bg-accent-rose/12 text-accent-rose border-accent-rose/25",
    teal: "bg-accent-teal/12 text-accent-teal border-accent-teal/25",
    sky: "bg-accent-sky/12 text-accent-sky border-accent-sky/25",
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: "bg-ink-tertiary", brand: "bg-brand-light",
    success: "bg-accent-teal", warning: "bg-accent-amber",
    danger: "bg-accent-rose", teal: "bg-accent-teal", sky: "bg-accent-sky",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border",
      variants[variant], className
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse-slow", dotColors[variant])} />}
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────
   PROGRESS
───────────────────────────────────────────── */
export function Progress({
  value, max = 100, variant = "brand", className, label,
}: {
  value: number;
  max?: number;
  variant?: "brand" | "teal" | "amber" | "rose";
  className?: string;
  label?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const tracks: Record<string, string> = {
    brand: "from-brand to-accent-sky",
    teal: "from-accent-teal to-accent-sky",
    amber: "from-accent-amber to-accent-rose",
    rose: "from-accent-rose to-accent-amber",
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex justify-between text-xs text-ink-tertiary">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-surface-DEFAULT rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", tracks[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
export function StatCard({
  label, value, delta, icon, variant = "default", sublabel,
}: {
  label: string;
  value: string | number;
  delta?: { value: number; label?: string };
  icon?: React.ReactNode;
  variant?: "default" | "brand" | "teal" | "amber" | "rose";
  sublabel?: string;
}) {
  const variants: Record<string, { bg: string; text: string; border: string }> = {
    default: { bg: "bg-surface-DEFAULT", text: "text-ink-secondary", border: "border-surface-border" },
    brand: { bg: "bg-brand/8", text: "text-brand-light", border: "border-brand/20" },
    teal: { bg: "bg-accent-teal/8", text: "text-accent-teal", border: "border-accent-teal/20" },
    amber: { bg: "bg-accent-amber/8", text: "text-accent-amber", border: "border-accent-amber/20" },
    rose: { bg: "bg-accent-rose/8", text: "text-accent-rose", border: "border-accent-rose/20" },
  };
  const v = variants[variant];

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-widest mb-2.5">{label}</p>
          <p className="font-display text-3xl font-bold text-ink-DEFAULT leading-none mb-1.5">{value}</p>
          {sublabel && <p className="text-xs text-ink-tertiary">{sublabel}</p>}
          {delta && (
            <p className={cn("text-xs font-semibold mt-1.5", delta.value >= 0 ? "text-accent-teal" : "text-accent-rose")}>
              {delta.value >= 0 ? "↑" : "↓"} {Math.abs(delta.value)}% {delta.label ?? ""}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border", v.bg, v.text, v.border)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   SCORE RING
───────────────────────────────────────────── */
export function ScoreRing({
  value, label, size = 72, thickness = 6,
}: {
  value: number;
  label: string;
  size?: number;
  thickness?: number;
}) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const color = value >= 85 ? "#0DCCB5" : value >= 65 ? "#6E42F5" : "#F5A623";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color}
            strokeWidth={thickness} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (value / 100) * circ }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-base font-bold" style={{ color }}>{value}</span>
        </div>
      </div>
      <p className="text-[10px] text-ink-tertiary tracking-wide text-center">{label}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TOGGLE
───────────────────────────────────────────── */
export function Toggle({
  checked, onChange, label, description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none group">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
          checked ? "bg-brand" : "bg-surface-active"
        )}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-ink-DEFAULT group-hover:text-white transition-colors">{label}</p>}
          {description && <p className="text-xs text-ink-tertiary mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
}

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */
export function Modal({
  open, onClose, title, children, size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}) {
  const sizes: Record<string, string> = {
    sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl", full: "max-w-6xl",
  };

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", duration: 0.35 }}
            className={cn(
              "relative w-full bg-canvas-100 border border-surface-border-strong rounded-2xl shadow-surface-lg overflow-hidden",
              sizes[size]
            )}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
                <h2 className="font-display text-lg font-bold">{title}</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-tertiary hover:text-ink-DEFAULT hover:bg-surface-hover transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

/* ─────────────────────────────────────────────
   DIVIDER
───────────────────────────────────────────── */
export function Divider({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 h-px bg-surface-border" />
      {label && <span className="text-xs text-ink-tertiary">{label}</span>}
      <div className="flex-1 h-px bg-surface-border" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   TOOLTIP
───────────────────────────────────────────── */
export function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-canvas-300 border border-surface-border text-xs text-ink-secondary rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-surface-md"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
