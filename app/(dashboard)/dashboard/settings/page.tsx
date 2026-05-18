"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { User, Key, Bell, Globe, Shield, Save, Eye, EyeOff, Copy } from "lucide-react";
import { Button, Card, Input, Toggle, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

const TABS = [
  { id:"profile", label:"Profile", icon:User },
  { id:"api", label:"API Keys", icon:Key },
  { id:"notifications", label:"Notifications", icon:Bell },
  { id:"integrations", label:"Integrations", icon:Globe },
  { id:"security", label:"Security", icon:Shield },
];

const INTEGRATIONS = [
  { name:"YouTube", icon:"▶", color:"#FF4444", connected:true, channel:"@MyChannel · 2.4K subs" },
  { name:"TikTok", icon:"♪", color:"#00F2EA", connected:true, channel:"@creator99 · 18.4K" },
  { name:"Instagram", icon:"◈", color:"#E1306C", connected:false, channel:null },
  { name:"LinkedIn", icon:"in", color:"#0077B5", connected:false, channel:null },
  { name:"X / Twitter", icon:"✕", color:"#1DA1F2", connected:false, channel:null },
];

const NOTIF_GROUPS = [
  { label:"Content", items:[
    { k:"renderDone", l:"Render Complete", d:"When your video finishes rendering" },
    { k:"uploadDone", l:"Published Successfully", d:"When a video goes live on a platform" },
  ]},
  { label:"Growth", items:[
    { k:"trendAlert", l:"Trend Alerts", d:"When a trend matches your niche" },
    { k:"weeklyDigest", l:"Weekly Analytics Digest", d:"Summary of top-performing content" },
    { k:"milestones", l:"Milestone Alerts", d:"When you hit views, follower goals" },
  ]},
  { label:"Account", items:[
    { k:"billing", l:"Billing Events", d:"Invoices, renewals, payment failures" },
    { k:"team", l:"Team Activity", d:"When teammates create or publish" },
    { k:"updates", l:"Product Updates", d:"New features and announcements" },
  ]},
];

export default function SettingsPage() {
  const { user } = useUser();
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(user?.fullName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [notifs, setNotifs] = useState<Record<string,boolean>>({
    renderDone:true, uploadDone:true, trendAlert:true, weeklyDigest:true,
    milestones:false, billing:true, team:false, updates:false,
  });

  async function save() {
    setSaving(true);
    await new Promise(r=>setTimeout(r,800));
    setSaving(false); setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight mb-1">Settings</h1>
        <p className="text-[#8B8BA8] text-sm">Manage your account, API keys, integrations, and notifications.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-44 flex-shrink-0 space-y-0.5">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left", tab===t.id?"bg-[#6E42F5]/12 text-[#8B62FF] border-l-2 border-[#6E42F5]":"text-[#8B8BA8] hover:bg-white/[0.04] hover:text-white border-l-2 border-transparent")}>
              <t.icon className="w-4 h-4 flex-shrink-0"/>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.div key={tab} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} transition={{duration:0.15}}>
            <Card>
              {tab === "profile" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6E42F5] to-[#F5426E] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                      {user?.firstName?.[0] ?? "U"}
                    </div>
                    <div>
                      <p className="font-semibold">{user?.fullName}</p>
                      <p className="text-sm text-[#8B8BA8]">{user?.primaryEmailAddress?.emailAddress}</p>
                      <Button variant="secondary" size="sm" className="mt-2">Change Avatar</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" value={name} onChange={e=>setName(e.target.value)} fullWidth/>
                    <Input label="Email" value={user?.primaryEmailAddress?.emailAddress??""} disabled fullWidth/>
                    <Input label="Creator Handle" defaultValue="@creator" fullWidth/>
                    <Input label="Website" placeholder="https://yoursite.com" fullWidth/>
                  </div>
                  <Input label="Bio" placeholder="Tell the world what you create…" fullWidth/>
                  <Button onClick={save} loading={saving} glow icon={<Save className="w-4 h-4"/>}>
                    {saved ? "✓ Saved!" : "Save Changes"}
                  </Button>
                </div>
              )}

              {tab === "api" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-[#F5A623]/8 border border-[#F5A623]/20">
                    <p className="text-sm font-semibold text-[#F5A623] mb-1">⚠️ Keep API keys secret</p>
                    <p className="text-xs text-[#8B8BA8]">Never share or commit API keys to version control.</p>
                  </div>
                  {[
                    { n:"Production Key", k:"vf_prod_AbCdEfGhIjKlMnOpQrStUv1234567890", created:"May 1 2025", used:"2 hours ago" },
                    { n:"Development Key", k:"vf_dev_ZyXwVuTsRqPoNmLkJiHgFeDcBa0987654", created:"Apr 15 2025", used:"Yesterday" },
                  ].map(key=>(
                    <Card key={key.n} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2"><p className="text-sm font-semibold">{key.n}</p><Badge variant="success">Active</Badge></div>
                          <div className="flex items-center gap-2 mb-2">
                            <code className="text-xs font-mono text-[#8B8BA8] bg-white/[0.04] px-2 py-1 rounded-lg truncate max-w-xs">{showKey?key.k:key.k.slice(0,12)+"•".repeat(20)}</code>
                            <button onClick={()=>setShowKey(!showKey)} className="text-[#4A4A64] hover:text-white transition-colors">{showKey?<EyeOff className="w-3.5 h-3.5"/>:<Eye className="w-3.5 h-3.5"/>}</button>
                            <button onClick={()=>navigator.clipboard.writeText(key.k).catch(()=>{})} className="text-[#4A4A64] hover:text-[#6E42F5] transition-colors"><Copy className="w-3.5 h-3.5"/></button>
                          </div>
                          <p className="text-xs text-[#4A4A64]">Created {key.created} · Last used {key.used}</p>
                        </div>
                        <Button variant="danger" size="sm">Revoke</Button>
                      </div>
                    </Card>
                  ))}
                  <Button icon={<Key className="w-4 h-4"/>}>Generate New API Key</Button>
                  <div>
                    <h3 className="font-display font-bold text-sm mb-4">Connected AI Services</h3>
                    {[
                      { n:"OpenAI", d:"GPT-4o for scripts & analysis", s:"connected", i:"🤖" },
                      { n:"ElevenLabs", d:"AI voiceover & voice cloning", s:"connected", i:"🎙️" },
                      { n:"Runway", d:"AI video generation", s:"disconnected", i:"🎬" },
                    ].map(svc=>(
                      <div key={svc.n} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-2">
                        <div className="flex items-center gap-3"><span className="text-xl">{svc.i}</span><div><p className="text-sm font-semibold">{svc.n}</p><p className="text-xs text-[#4A4A64]">{svc.d}</p></div></div>
                        <div className="flex items-center gap-2">
                          <Badge variant={svc.s==="connected"?"success":"default"}>{svc.s}</Badge>
                          <Button variant="secondary" size="xs">{svc.s==="connected"?"Config":"Connect"}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "notifications" && (
                <div className="space-y-6">
                  {NOTIF_GROUPS.map(group=>(
                    <div key={group.label}>
                      <h3 className="font-display font-bold text-sm mb-3 text-[#8B8BA8] uppercase tracking-widest text-[11px]">{group.label}</h3>
                      <div className="space-y-4">
                        {group.items.map(item=>(
                          <div key={item.k} className="flex items-center justify-between">
                            <div><p className="text-sm font-medium">{item.l}</p><p className="text-xs text-[#4A4A64]">{item.d}</p></div>
                            <Toggle checked={notifs[item.k]??false} onChange={v=>setNotifs({...notifs,[item.k]:v})}/>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "integrations" && (
                <div className="space-y-4">
                  <p className="text-sm text-[#8B8BA8]">Connect social accounts to enable auto-publishing and cross-platform scheduling.</p>
                  {INTEGRATIONS.map(p=>(
                    <div key={p.name} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-[#0E0E1A] hover:border-white/[0.10] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold" style={{background:`${p.color}18`,color:p.color,border:`1px solid ${p.color}30`}}>{p.icon}</div>
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-xs text-[#4A4A64]">{p.connected ? p.channel : "Not connected"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={p.connected?"success":"default"}>{p.connected?"Connected":"Disconnected"}</Badge>
                        <Button variant={p.connected?"danger":"secondary"} size="sm">{p.connected?"Disconnect":"Connect"}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "security" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#0DCCB5]/8 border border-[#0DCCB5]/20">
                    <p className="text-sm font-semibold text-[#0DCCB5] mb-1">✓ Account Secured</p>
                    <p className="text-xs text-[#8B8BA8]">Your account is protected with Clerk authentication. Manage security settings in your Clerk dashboard.</p>
                  </div>
                  {[
                    { l:"Two-Factor Authentication", d:"Add an extra layer of security", s:"Enabled" },
                    { l:"Active Sessions", d:"Manage logged-in devices", s:"3 devices" },
                    { l:"Login History", d:"Recent sign-in activity", s:"View" },
                  ].map(item=>(
                    <div key={item.l} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-[#0E0E1A]">
                      <div><p className="text-sm font-semibold">{item.l}</p><p className="text-xs text-[#4A4A64]">{item.d}</p></div>
                      <Button variant="secondary" size="sm">{item.s}</Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
