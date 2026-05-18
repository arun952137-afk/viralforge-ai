"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, TrendingUp, Zap, X } from "lucide-react";
import { Button, Badge } from "@/components/ui";

const LABELS: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/create": "Create Video",
  "/dashboard/scripts": "Script Engine",
  "/dashboard/editor": "Video Editor",
  "/dashboard/voice": "Voice Studio",
  "/dashboard/trends": "Trend Radar",
  "/dashboard/analytics": "Analytics",
  "/dashboard/calendar": "Content Calendar",
  "/dashboard/repurpose": "Repurpose Studio",
  "/dashboard/projects": "Projects",
  "/dashboard/team": "Team",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Settings",
  "/dashboard/admin": "Admin",
};

const NOTIFS = [
  { id: "1", icon: "🎬", title: "Video ready", body: "Balloon Adventure finished rendering. 4K export available.", time: "2m ago", read: false },
  { id: "2", icon: "📈", title: "Trend alert", body: "\"AI reveals…\" format is spiking +340% — post in the next 4 hours.", time: "12m ago", read: false },
  { id: "3", icon: "💰", title: "Affiliate commission", body: "New referral signed up. You earned $14.70.", time: "2h ago", read: true },
];

export function TopBar() {
  const pathname = usePathname();
  const [search, setSearch] = useState(false);
  const [notifs, setNotifs] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFS);
  const unread = notifications.filter(n => !n.read).length;
  const title = LABELS[pathname] ?? "Dashboard";

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-surface-border bg-canvas/80 backdrop-blur-xl sticky top-0 z-10">
      {/* Left */}
      <h1 className="font-display text-xl font-bold tracking-tight">{title}</h1>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <AnimatePresence>
          {search ? (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="overflow-hidden">
              <input
                autoFocus
                placeholder="Search videos, scripts, trends…"
                onBlur={() => setSearch(false)}
                className="w-full bg-canvas-100 border border-surface-border rounded-xl px-4 py-2 text-sm text-ink-DEFAULT placeholder:text-ink-disabled outline-none focus:border-brand/40"
              />
            </motion.div>
          ) : (
            <button onClick={() => setSearch(true)} className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-tertiary hover:text-ink-DEFAULT hover:bg-surface-DEFAULT transition-colors">
              <Search className="w-4 h-4" />
            </button>
          )}
        </AnimatePresence>

        {/* Live trends pill */}
        <Link href="/dashboard/trends" className="hidden sm:flex">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-teal/10 border border-accent-teal/20 text-accent-teal text-xs font-semibold hover:bg-accent-teal/15 transition-colors cursor-pointer">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse-slow" />
            Live Trends
          </div>
        </Link>

        {/* Create */}
        <Link href="/dashboard/create" className="hidden sm:block">
          <Button size="sm" icon={<Zap className="w-3.5 h-3.5" />}>New Video</Button>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifs(v => !v)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-ink-tertiary hover:text-ink-DEFAULT hover:bg-surface-DEFAULT transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-rose text-[9px] font-bold text-white flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifs && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 w-96 bg-canvas-100 border border-surface-border-strong rounded-2xl shadow-surface-lg overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm">Notifications</span>
                    {unread > 0 && <Badge variant="danger">{unread} new</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {unread > 0 && <button onClick={() => setNotifications(n => n.map(x => ({...x, read: true})))} className="text-xs text-brand-light hover:text-brand font-medium">Mark all read</button>}
                    <button onClick={() => setNotifs(false)} className="text-ink-tertiary hover:text-ink-DEFAULT"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? {...x, read: true} : x))}
                      className={`flex gap-3.5 px-5 py-4 border-b border-surface-border cursor-pointer transition-colors hover:bg-surface-DEFAULT ${!n.read ? "bg-brand/4" : ""}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-surface-DEFAULT border border-surface-border flex items-center justify-center text-xl flex-shrink-0">{n.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className="text-sm font-semibold">{n.title}</p>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-brand-light flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-xs text-ink-tertiary leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-ink-disabled mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <UserButton  appearance={{ elements: { avatarBox: "w-9 h-9 rounded-xl" } }} />
      </div>
    </header>
  );
}
