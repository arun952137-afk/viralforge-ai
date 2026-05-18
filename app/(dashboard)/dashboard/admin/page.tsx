"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Shield, Users, TrendingUp, DollarSign, Cpu, Search, AlertCircle, Check, ChevronUp, ChevronDown } from "lucide-react";
import { StatCard, Card, Badge, Button, Input, Skeleton } from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MRR = Array.from({length:12},(_,i)=>({m:["J","F","M","A","M","J","J","A","S","O","N","D"][i],v:Math.floor(280000+i*18000+Math.random()*15000)}));
const USERS = [
  { email:"creator1@mail.com", name:"Alex Chen", plan:"PRO", status:"ACTIVE", credits:380, videos:47, joined:"May 1" },
  { email:"creator2@mail.com", name:"Sarah Kim", plan:"ENTERPRISE", status:"ACTIVE", credits:1840, videos:214, joined:"Apr 28" },
  { email:"creator3@mail.com", name:"Mike Johnson", plan:"FREE", status:"INACTIVE", credits:12, videos:8, joined:"Apr 25" },
  { email:"creator4@mail.com", name:"Priya Patel", plan:"PRO", status:"PAST_DUE", credits:240, videos:31, joined:"Apr 20" },
  { email:"creator5@mail.com", name:"James Wilson", plan:"CREATOR_PRO", status:"ACTIVE", credits:95, videos:89, joined:"Apr 15" },
];
const PLAN_COLORS: Record<string,string> = { FREE:"#4A4A64", PRO:"#6E42F5", CREATOR_PRO:"#42B4F5", ENTERPRISE:"#0DCCB5" };
const STATUS_VARIANT: Record<string,any> = { ACTIVE:"success", INACTIVE:"default", PAST_DUE:"warning", CANCELED:"danger" };
const Tip = ({active,payload,label}:any)=>{
  if(!active||!payload?.length)return null;
  return <div className="bg-[#0E0E1A] border border-white/10 rounded-xl p-3 text-xs"><p className="text-[#8B8BA8] mb-1">{label}</p>{payload.map((p:any)=><div key={p.name} className="flex justify-between gap-4"><span style={{color:p.color}}>{p.name}</span><span className="font-bold text-white">₹{formatNumber(p.value)}</span></div>)}</div>;
};

export default function AdminPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const filtered = USERS.filter(u=>{
    const ms = u.email.includes(search)||u.name.toLowerCase().includes(search.toLowerCase());
    const mp = planFilter==="all"||u.plan===planFilter;
    return ms&&mp;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6E42F5]/15 border border-[#6E42F5]/30 flex items-center justify-center"><Shield className="w-5 h-5 text-[#6E42F5]"/></div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Admin Panel</h1>
            <p className="text-[#8B8BA8] text-sm">Platform overview and user management</p>
          </div>
        </div>
        <Badge variant="danger">Admin Only</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={formatNumber(183421)} icon={<Users className="w-4 h-4"/>} variant="brand" delta={{value:12,label:"this month"}}/>
        <StatCard label="Active Subscribers" value={formatNumber(12847)} icon={<TrendingUp className="w-4 h-4"/>} variant="teal" delta={{value:8,label:"growth"}}/>
        <StatCard label="Monthly Revenue" value="₹48.7L" icon={<DollarSign className="w-4 h-4"/>} variant="amber" delta={{value:18,label:"vs last month"}}/>
        <StatCard label="Videos Generated" value={formatNumber(2418930)} icon={<Cpu className="w-4 h-4"/>} variant="rose"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-display font-bold text-base mb-5">Monthly Recurring Revenue</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MRR} margin={{top:0,right:8,bottom:0,left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="m" tick={{fill:"#4A4A64",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#4A4A64",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${formatNumber(v)}`}/>
                <Tooltip content={<Tip/>}/>
                <Bar dataKey="v" name="MRR" fill="#6E42F5" radius={[6,6,0,0]} fillOpacity={0.85}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-display font-bold text-sm mb-4">Plan Distribution</h3>
            {[
              {p:"Free", n:168000, c:"#4A4A64", pct:92},
              {p:"Creator Pro", n:8200, c:"#42B4F5", pct:4.5},
              {p:"Studio", n:4100, c:"#6E42F5", pct:2.2},
              {p:"Enterprise", n:547, c:"#0DCCB5", pct:0.3},
            ].map(item=>(
              <div key={item.p} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5"><span className="text-[#8B8BA8]">{item.p}</span><span className="font-bold" style={{color:item.c}}>{formatNumber(item.n)} ({item.pct}%)</span></div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden"><motion.div className="h-full rounded-full" style={{background:item.c}} initial={{width:0}} animate={{width:`${item.pct}%`}} transition={{duration:0.9}}/></div>
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4"><Cpu className="w-4 h-4 text-[#6E42F5]"/><h3 className="font-display font-bold text-sm">Render Queue</h3></div>
            {[
              {l:"Completed",v:2418000,c:"#0DCCB5",variant:"success" as const},
              {l:"Processing",v:23,c:"#F5A623",variant:"warning" as const},
              {l:"Pending",v:47,c:"#8B8BA8",variant:"default" as const},
              {l:"Failed",v:142,c:"#F5426E",variant:"danger" as const},
            ].map(s=>(
              <div key={s.l} className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:s.c}}/><span className="text-xs text-[#8B8BA8]">{s.l}</span></div>
                <Badge variant={s.variant}>{formatNumber(s.v)}</Badge>
              </div>
            ))}
            <div className="mt-3 p-2.5 rounded-xl bg-[#F5426E]/8 border border-[#F5426E]/20 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#F5426E] flex-shrink-0"/>
              <p className="text-[10px] text-[#F5426E]">High failure rate. Check render workers.</p>
            </div>
          </Card>
        </div>
      </div>

      {/* User table */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between gap-4">
          <h3 className="font-display font-bold text-base">Recent Users</h3>
          <div className="flex gap-3 flex-1 max-w-lg">
            <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by email or name…" prefixIcon={<Search className="w-4 h-4"/>} className="flex-1"/>
            <select value={planFilter} onChange={e=>setPlanFilter(e.target.value)} className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#6E42F5]/50 cursor-pointer">
              <option value="all" className="bg-[#0E0E1A]">All Plans</option>
              {["FREE","PRO","CREATOR_PRO","ENTERPRISE"].map(p=><option key={p} value={p} className="bg-[#0E0E1A]">{p}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/[0.04]">
              {["User","Plan","Status","Videos","Credits","Joined","Actions"].map(h=>(
                <th key={h} className="text-left px-6 py-3 text-[10px] font-bold text-[#4A4A64] uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((u,i)=>(
                <motion.tr key={u.email} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6E42F5] to-[#0DCCB5] flex items-center justify-center text-xs font-bold text-white">{(u.name||u.email)[0].toUpperCase()}</div>
                      <div><p className="text-sm font-semibold">{u.name}</p><p className="text-xs text-[#4A4A64]">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-xs font-bold px-2 py-1 rounded-lg border" style={{color:PLAN_COLORS[u.plan],background:`${PLAN_COLORS[u.plan]}18`,borderColor:`${PLAN_COLORS[u.plan]}30`}}>{u.plan}</span></td>
                  <td className="px-6 py-4"><Badge variant={STATUS_VARIANT[u.status]??("default" as any)}>{u.status}</Badge></td>
                  <td className="px-6 py-4 text-[#8B8BA8]">{u.videos}</td>
                  <td className="px-6 py-4 text-[#8B8BA8]">{u.credits}</td>
                  <td className="px-6 py-4 text-xs text-[#4A4A64]">{u.joined}</td>
                  <td className="px-6 py-4"><div className="flex gap-1.5"><Button variant="ghost" size="xs">View</Button><Button variant="secondary" size="xs">Edit</Button></div></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
