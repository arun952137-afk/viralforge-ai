"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Zap, X, Check } from "lucide-react";
import { Button, Card, Badge, Modal, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

const PLATFORMS_CONFIG: Record<string, { color: string; icon: string }> = {
  "YouTube Shorts": { color: "#FF4444", icon: "▶" },
  "TikTok": { color: "#00F2EA", icon: "♪" },
  "Instagram Reels": { color: "#E1306C", icon: "◈" },
  "LinkedIn": { color: "#0077B5", icon: "in" },
  "X / Twitter": { color: "#1DA1F2", icon: "✕" },
};

interface ScheduledPost {
  id: string; title: string; platform: string;
  time: string; status: "scheduled"|"draft"|"published"; score?: number;
  day: number; month: number; year: number;
}

const NOW = new Date();
const INIT_POSTS: ScheduledPost[] = [
  { id:"1", title:"Balloon Adventure Ep.4", platform:"YouTube Shorts", time:"3:00 PM", status:"scheduled", score:92, day:NOW.getDate(), month:NOW.getMonth(), year:NOW.getFullYear() },
  { id:"2", title:"Rainbow Bus Dance", platform:"TikTok", time:"5:00 PM", status:"scheduled", score:88, day:NOW.getDate()+1, month:NOW.getMonth(), year:NOW.getFullYear() },
  { id:"3", title:"Cloud Kingdom BTS", platform:"Instagram Reels", time:"12:00 PM", status:"draft", day:NOW.getDate()+2, month:NOW.getMonth(), year:NOW.getFullYear() },
  { id:"4", title:"Creator Tips Thread", platform:"X / Twitter", time:"9:00 AM", status:"scheduled", score:79, day:NOW.getDate()+3, month:NOW.getMonth(), year:NOW.getFullYear() },
  { id:"5", title:"Behind the Scenes", platform:"LinkedIn", time:"10:00 AM", status:"published", day:NOW.getDate()-1, month:NOW.getMonth(), year:NOW.getFullYear() },
  { id:"6", title:"Magic Garden Ep.5", platform:"YouTube Shorts", time:"3:00 PM", status:"scheduled", score:94, day:NOW.getDate()+7, month:NOW.getMonth(), year:NOW.getFullYear() },
  { id:"7", title:"3D Animation Tutorial", platform:"TikTok", time:"6:00 PM", status:"draft", day:NOW.getDate()+5, month:NOW.getMonth(), year:NOW.getFullYear() },
];

const PLATFORMS_LIST = Object.keys(PLATFORMS_CONFIG).map(k=>({value:k,label:k}));
const TIMES = ["8:00 AM","9:00 AM","10:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM"].map(t=>({value:t,label:t}));
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>(INIT_POSTS);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newPost, setNewPost] = useState({ title:"", platform:"YouTube Shorts", time:"3:00 PM" });
  const [view, setView] = useState<"month"|"week">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }

  function getPostsForDay(day: number) {
    return posts.filter(p => p.day === day && p.month === month && p.year === year);
  }

  function addPost() {
    if (!newPost.title.trim() || !selectedDay) return;
    const p: ScheduledPost = {
      id: Date.now().toString(),
      title: newPost.title,
      platform: newPost.platform,
      time: newPost.time,
      status: "scheduled",
      score: Math.floor(75 + Math.random() * 20),
      day: selectedDay,
      month, year,
    };
    setPosts(prev => [...prev, p]);
    setNewPost({ title:"", platform:"YouTube Shorts", time:"3:00 PM" });
    setShowModal(false);
  }

  const cells: Array<{ day: number; isCurrentMonth: boolean; isToday: boolean }> = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: prevMonthDays - firstDay + i + 1, isCurrentMonth: false, isToday: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === NOW.getDate() && month === NOW.getMonth() && year === NOW.getFullYear();
    cells.push({ day: d, isCurrentMonth: true, isToday });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, isCurrentMonth: false, isToday: false });
  }

  const totalScheduled = posts.filter(p=>p.status==="scheduled").length;
  const totalPublished = posts.filter(p=>p.status==="published").length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight mb-1">Content Calendar</h1>
          <p className="text-[#8B8BA8] text-sm">Plan, schedule, and automate your content pipeline across all platforms.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-[#111120] border border-white/[0.06] rounded-xl">
            {(["month","week"] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all", view===v?"bg-[#6E42F5] text-white":"text-[#8B8BA8] hover:text-white")}>{v}</button>
            ))}
          </div>
          <Button icon={<Plus className="w-4 h-4"/>} onClick={()=>{setSelectedDay(NOW.getDate());setShowModal(true);}}>Schedule Post</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l:"Scheduled", v:totalScheduled, c:"#6E42F5" },
          { l:"Published", v:totalPublished, c:"#0DCCB5" },
          { l:"Best Day", v:"Saturday", c:"#F5A623" },
          { l:"Best Time", v:"3–5 PM", c:"#F5426E" },
        ].map(s=>(
          <Card key={s.l} className="p-4">
            <p className="text-[10px] text-[#4A4A64] uppercase tracking-widest mb-1">{s.l}</p>
            <p className="font-display text-2xl font-bold" style={{color:s.c}}>{s.v}</p>
          </Card>
        ))}
      </div>

      {/* Platform legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PLATFORMS_CONFIG).map(([name, cfg])=>(
          <div key={name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-[#8B8BA8]">
            <div className="w-2 h-2 rounded-full" style={{background:cfg.color}}/>
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <Card padding={false} className="overflow-hidden">
        {/* Month header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-bold text-lg">{MONTHS[month]} {year}</h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B8BA8] hover:text-white hover:bg-white/[0.06] transition-all"><ChevronLeft className="w-4 h-4"/></button>
            <button onClick={()=>setCurrentDate(new Date())} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8B8BA8] hover:text-white hover:bg-white/[0.06] transition-all">Today</button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B8BA8] hover:text-white hover:bg-white/[0.06] transition-all"><ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/[0.04]">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
            <div key={d} className="py-3 text-center text-[11px] font-bold text-[#4A4A64] uppercase tracking-widest">{d}</div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const cellPosts = cell.isCurrentMonth ? getPostsForDay(cell.day) : [];
            return (
              <div
                key={i}
                onClick={()=>{ if(cell.isCurrentMonth){setSelectedDay(cell.day);setShowModal(true);}}}
                className={cn(
                  "min-h-[100px] p-2 border-b border-r border-white/[0.04] transition-colors cursor-pointer",
                  cell.isCurrentMonth ? "hover:bg-white/[0.02]" : "opacity-30 pointer-events-none",
                  cell.isToday && "bg-[#6E42F5]/5",
                  (i+1)%7===0 && "border-r-0",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full", cell.isToday ? "bg-[#6E42F5] text-white" : "text-[#8B8BA8]")}>{cell.day}</span>
                  {cellPosts.length > 0 && <span className="text-[10px] text-[#4A4A64]">{cellPosts.length}</span>}
                </div>
                <div className="space-y-1">
                  {cellPosts.slice(0, 3).map(post => {
                    const cfg = PLATFORMS_CONFIG[post.platform];
                    return (
                      <div
                        key={post.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium truncate"
                        style={{ background: `${cfg?.color}18`, borderLeft: `2px solid ${cfg?.color}`, color: cfg?.color }}
                        onClick={e=>e.stopPropagation()}
                      >
                        <span className="flex-shrink-0">{post.status==="published"?"✓":post.status==="draft"?"✎":"◷"}</span>
                        <span className="truncate">{post.title}</span>
                      </div>
                    );
                  })}
                  {cellPosts.length > 3 && <p className="text-[10px] text-[#4A4A64] px-1">+{cellPosts.length-3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Upcoming posts sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <h3 className="font-display font-bold text-base mb-3">Upcoming Schedule</h3>
          <div className="space-y-2">
            {posts.filter(p=>p.status!=="published").sort((a,b)=>a.day-b.day).slice(0,8).map(post=>{
              const cfg = PLATFORMS_CONFIG[post.platform];
              return (
                <motion.div key={post.id} whileHover={{x:2}} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#0E0E1A] hover:border-white/[0.10] transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0" style={{background:`${cfg?.color}18`,color:cfg?.color}}>{cfg?.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{post.title}</p>
                    <p className="text-xs text-[#4A4A64]">{MONTHS[post.month].slice(0,3)} {post.day} · {post.time}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {post.score && <span className="text-xs font-bold" style={{color:post.score>=90?"#0DCCB5":"#6E42F5"}}>{post.score}</span>}
                    <Badge variant={post.status==="scheduled"?"brand":post.status==="draft"?"default":"success"}>{post.status}</Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <Card className="p-5">
          <h3 className="font-display font-bold text-sm mb-4">🎯 AI Schedule Optimizer</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0DCCB5]/8 border border-[#0DCCB5]/20">
              <p className="font-semibold text-[#0DCCB5] mb-1">Best slot this week</p>
              <p className="text-[#8B8BA8]">Saturday 3:00 PM — based on your audience data</p>
            </div>
            <div className="p-3 rounded-xl bg-[#6E42F5]/8 border border-[#6E42F5]/20">
              <p className="font-semibold text-[#6E42F5] mb-1">Optimal frequency</p>
              <p className="text-[#8B8BA8]">4–5 posts/week keeps your algo score high without burnout</p>
            </div>
            <div className="p-3 rounded-xl bg-[#F5A623]/8 border border-[#F5A623]/20">
              <p className="font-semibold text-[#F5A623] mb-1">Gap detected</p>
              <p className="text-[#8B8BA8]">No content scheduled for Wednesday — your audience is most active then</p>
            </div>
          </div>
          <Button className="w-full mt-4" size="sm" variant="secondary" icon={<Zap className="w-3.5 h-3.5"/>}>Auto-optimize Schedule</Button>
        </Card>
      </div>

      {/* Add post modal */}
      <Modal open={showModal} onClose={()=>setShowModal(false)} title={`Schedule for ${MONTHS[month].slice(0,3)} ${selectedDay}`} size="sm">
        <div className="space-y-4">
          <Input label="Post Title" value={newPost.title} onChange={e=>setNewPost({...newPost,title:e.target.value})} placeholder="Your video or post title…" fullWidth/>
          <Select label="Platform" value={newPost.platform} onChange={v=>setNewPost({...newPost,platform:v})} options={PLATFORMS_LIST}/>
          <Select label="Post Time" value={newPost.time} onChange={v=>setNewPost({...newPost,time:v})} options={TIMES}/>
          <div className="p-3 rounded-xl bg-[#0DCCB5]/8 border border-[#0DCCB5]/20 text-xs text-[#8B8BA8]">
            🎯 AI recommends <span className="text-[#0DCCB5] font-semibold">3:00 PM</span> for maximum reach on {newPost.platform}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={()=>setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={addPost} disabled={!newPost.title.trim()} glow icon={<Check className="w-4 h-4"/>}>Schedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
