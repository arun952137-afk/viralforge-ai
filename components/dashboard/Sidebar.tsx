"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard, Zap, FileText, TrendingUp, Mic,
  Video, BarChart3, Upload, FolderOpen, Users,
  CreditCard, Settings, Shield, Calendar, RefreshCw,
  ChevronLeft, ChevronRight, Plus, Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    section: "Create",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
      { href: "/dashboard/create", icon: Zap, label: "Create", badge: "AI" },
      { href: "/dashboard/scripts", icon: FileText, label: "Scripts" },
      { href: "/dashboard/editor", icon: Video, label: "Editor" },
      { href: "/dashboard/voice", icon: Mic, label: "Voice Studio" },
      { href: "/dashboard/repurpose", icon: RefreshCw, label: "Repurpose" },
    ],
  },
  {
    section: "Grow",
    items: [
      { href: "/dashboard/trends", icon: TrendingUp, label: "Trend Radar", badge: "Live" },
      { href: "/dashboard/calendar", icon: Calendar, label: "Calendar" },
      { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/dashboard/upload", icon: Upload, label: "Publish" },
    ],
  },
  {
    section: "Manage",
    items: [
      { href: "/dashboard/projects", icon: FolderOpen, label: "Projects" },
      { href: "/dashboard/team", icon: Users, label: "Team" },
      { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
      { href: "/dashboard/admin", icon: Shield, label: "Admin", admin: true },
      { href: "/dashboard/growth-agent", icon: Cpu, label: "Growth Agent", admin: true },
    ],
  },
];

const PLAN_STYLES: Record<string, { color: string; bg: string }> = {
  FREE: { color: "#4A4A64", bg: "#4A4A6415" },
  STARTER: { color: "#42B4F5", bg: "#42B4F515" },
  PRO: { color: "#6E42F5", bg: "#6E42F515" },
  AGENCY: { color: "#F5426E", bg: "#F5426E15" },
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  const plan = (user?.publicMetadata?.plan as string) ?? "FREE";
  const credits = (user?.publicMetadata?.credits as number) ?? 30;
  const maxCredits = (user?.publicMetadata?.maxCredits as number) ?? 30;
  const creditPct = Math.min(100, Math.round((credits / maxCredits) * 100));
  const planStyle = PLAN_STYLES[plan] ?? PLAN_STYLES.FREE;

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 232 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="flex-shrink-0 h-full bg-canvas-50 border-r border-surface-border flex flex-col overflow-hidden z-20 relative"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-[18px] border-b border-surface-border flex-shrink-0">
        <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-brand flex items-center justify-center shadow-brand-sm">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              className="font-display font-bold text-[15px] whitespace-nowrap tracking-tight"
            >
              <span className="text-gradient-brand">Viral</span>
              <span className="text-ink-DEFAULT">Forge</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Credits bar */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mx-3 mt-3 flex-shrink-0"
          >
            <div
              className="p-3 rounded-xl border"
              style={{ background: planStyle.bg, borderColor: `${planStyle.color}25` }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: planStyle.color }}>
                  {plan}
                </span>
                <span className="text-[10px] text-ink-tertiary">{credits}/{maxCredits} cr</span>
              </div>
              <div className="h-1 bg-surface-DEFAULT rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: planStyle.color, width: `${creditPct}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${creditPct}%` }}
                />
              </div>
              {creditPct < 20 && (
                <Link href="/dashboard/billing">
                  <p className="text-[10px] mt-1.5 font-semibold" style={{ color: planStyle.color }}>
                    ⚡ Upgrade for more →
                  </p>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Video Quick Button */}
      <div className="px-3 mt-3 flex-shrink-0">
        <Link href="/dashboard/create">
          <motion.div
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-brand/15 border border-brand/25 text-brand-light hover:bg-brand/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-sm font-semibold whitespace-nowrap"
                >
                  New Video
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5 scrollbar-none">
        {NAV.map((group) => (
          <div key={group.section}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="px-2 mb-1.5 text-[10px] font-bold text-ink-disabled uppercase tracking-widest"
                >
                  {group.section}
                </motion.p>
              )}
            </AnimatePresence>

            {group.items.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-0.5 transition-all duration-150 group cursor-pointer",
                    isActive
                      ? "bg-brand/12 text-brand-light"
                      : "text-ink-tertiary hover:bg-surface-DEFAULT hover:text-ink-DEFAULT"
                  )}>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-1 bottom-1 w-0.5 bg-brand rounded-full"
                      />
                    )}
                    <item.icon className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActive ? "text-brand-light" : "text-ink-disabled group-hover:text-ink-tertiary"
                    )} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center justify-between flex-1 min-w-0"
                        >
                          <span className="text-[13px] font-medium truncate">{item.label}</span>
                          {(item as any).badge && (
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                              (item as any).badge === "AI" ? "bg-brand/20 text-brand-light" : "bg-accent-teal/15 text-accent-teal"
                            )}>
                              {(item as any).badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-surface-border p-3 flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-brand to-accent-sky flex items-center justify-center text-[11px] font-bold text-white">
          {user?.firstName?.[0] ?? "U"}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-[13px] font-semibold truncate">{user?.fullName ?? "Creator"}</p>
              <p className="text-[11px] text-ink-tertiary truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-6 flex-shrink-0 rounded-lg flex items-center justify-center text-ink-tertiary hover:text-ink-DEFAULT hover:bg-surface-DEFAULT transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </motion.aside>
  );
}
