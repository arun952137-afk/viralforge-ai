"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play, Pause, Scissors, Volume2, VolumeX, Maximize2,
  Type, Layers, Wand2, Download, Upload, Plus, X,
  ChevronLeft, ChevronRight, SkipBack, SkipForward,
  AlignLeft, Mic, Image, Zap, Check
} from "lucide-react";
import { Button, Card, Badge, Toggle } from "@/components/ui";
import { cn } from "@/lib/utils";

const TRACKS = [
  { id: "video", label: "Video", color: "#6E42F5", clips: [
    { id:"v1", start:0, width:35, label:"Intro Scene", thumbnail:"🎬" },
    { id:"v2", start:36, width:28, label:"Main Story", thumbnail:"🎭" },
    { id:"v3", start:65, width:22, label:"Climax", thumbnail:"⚡" },
    { id:"v4", start:88, width:12, label:"CTA", thumbnail:"📣" },
  ]},
  { id: "audio", label: "Audio", color: "#0DCCB5", clips: [
    { id:"a1", start:0, width:100, label:"Background Music", thumbnail:"🎵" },
  ]},
  { id: "voice", label: "Voiceover", color: "#F5A623", clips: [
    { id:"vo1", start:2, width:94, label:"AI Narration", thumbnail:"🎙️" },
  ]},
  { id: "captions", label: "Captions", color: "#F5426E", clips: [
    { id:"c1", start:0, width:100, label:"Auto Captions", thumbnail:"💬" },
  ]},
];

const AI_TOOLS = [
  { icon: Scissors, label: "Remove Silence", desc: "Auto-detect & cut silent parts", action: "Applied to 3 clips" },
  { icon: Type, label: "Auto Captions", desc: "AI-powered subtitle generation", action: "94 words detected" },
  { icon: Wand2, label: "Smart Crop", desc: "Portrait 9:16 reframe", action: "Ready to apply" },
  { icon: Volume2, label: "Audio Enhance", desc: "Noise removal + EQ", action: "Processing…" },
  { icon: Zap, label: "Jump Cuts", desc: "Auto-remove filler words", action: "12 cuts suggested" },
  { icon: Layers, label: "B-Roll Insert", desc: "AI suggests relevant clips", action: "8 matches found" },
];

const EXPORT_PRESETS = [
  { label: "TikTok / Reels", res: "1080×1920", fps: 30, format: "MP4" },
  { label: "YouTube Shorts", res: "1080×1920", fps: 60, format: "MP4" },
  { label: "YouTube (16:9)", res: "1920×1080", fps: 60, format: "MP4" },
  { label: "LinkedIn", res: "1080×1080", fps: 30, format: "MP4" },
];

export default function EditorPage() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [activePanel, setActivePanel] = useState<"tools"|"export"|"captions">("tools");
  const [appliedTools, setAppliedTools] = useState<string[]>([]);
  const [showExport, setShowExport] = useState(false);

  const totalDuration = 54;
  const pct = (currentTime / totalDuration) * 100;

  function applyTool(label: string) {
    setAppliedTools(prev => prev.includes(label) ? prev : [...prev, label]);
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight mb-1">Video Editor</h1>
          <p className="text-[#8B8BA8] text-sm">AI-powered creator editing workflow — captions, cuts, reframe, export.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={<Upload className="w-3.5 h-3.5"/>}>Import</Button>
          <Button size="sm" icon={<Download className="w-3.5 h-3.5"/>} onClick={()=>setShowExport(true)}>Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Main preview */}
        <div className="xl:col-span-3 space-y-3">
          {/* Video preview */}
          <Card className="p-0 overflow-hidden relative" style={{aspectRatio:"16/9",background:"#000"}}>
            {/* Preview area */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full bg-gradient-to-br from-[#6E42F5]/30 to-[#0DCCB5]/20 flex items-center justify-center">
                {/* Fake video frame */}
                <div className="w-1/3 h-full bg-gradient-to-b from-[#6E42F5]/20 to-transparent flex items-center justify-center">
                  <span className="text-6xl">🎈</span>
                </div>
                {/* Caption overlay */}
                <div className="absolute bottom-8 inset-x-0 text-center">
                  <div className="inline-block bg-black/80 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <p className="text-white font-bold text-lg">What if one balloon could change everything?</p>
                  </div>
                </div>
                {/* Time indicator */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-white">
                  {String(Math.floor(currentTime/60)).padStart(2,"0")}:{String(Math.floor(currentTime%60)).padStart(2,"0")} / {String(Math.floor(totalDuration/60)).padStart(2,"0")}:{String(Math.floor(totalDuration%60)).padStart(2,"0")}
                </div>
                {/* 9:16 portrait overlay */}
                <div className="absolute top-2 right-4 bg-[#6E42F5]/80 px-2 py-1 rounded-lg text-[10px] font-bold text-white">9:16</div>
              </div>
            </div>
          </Card>

          {/* Transport controls */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button onClick={()=>setCurrentTime(0)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B8BA8] hover:text-white hover:bg-white/[0.06] transition-all"><SkipBack className="w-4 h-4"/></button>
                <button onClick={()=>setPlaying(!playing)} className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#6E42F5] text-white shadow-[0_0_16px_rgba(110,66,245,0.4)] hover:bg-[#8B62FF] transition-all">
                  {playing ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5 ml-0.5"/>}
                </button>
                <button onClick={()=>setCurrentTime(totalDuration)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B8BA8] hover:text-white hover:bg-white/[0.06] transition-all"><SkipForward className="w-4 h-4"/></button>
                <button onClick={()=>setMuted(!muted)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B8BA8] hover:text-white hover:bg-white/[0.06] transition-all">
                  {muted ? <VolumeX className="w-4 h-4"/> : <Volume2 className="w-4 h-4"/>}
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#4A4A64]">
                <span>Zoom:</span>
                <input type="range" min={50} max={200} value={zoom} onChange={e=>setZoom(parseInt(e.target.value))} className="w-24 accent-[#6E42F5]"/>
                <span>{zoom}%</span>
              </div>
            </div>

            {/* Scrubber */}
            <div className="relative h-2 bg-white/[0.06] rounded-full mb-4 cursor-pointer" onClick={e=>{
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              setCurrentTime(Math.floor(x * totalDuration));
            }}>
              <motion.div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#6E42F5] to-[#0DCCB5]" style={{width:`${pct}%`}}/>
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg" style={{left:`${pct}%`,transform:"translate(-50%,-50%)"}}/>
            </div>

            {/* Timeline tracks */}
            <div className="space-y-2 overflow-x-auto scrollbar-none">
              {TRACKS.map(track => (
                <div key={track.id} className="flex items-center gap-3 h-10">
                  <span className="text-[10px] font-bold text-[#4A4A64] w-16 shrink-0 uppercase tracking-wider">{track.label}</span>
                  <div className="flex-1 relative h-full bg-white/[0.02] rounded-lg overflow-hidden border border-white/[0.04]">
                    {track.clips.map(clip => (
                      <div
                        key={clip.id}
                        className="absolute top-1 bottom-1 rounded-md flex items-center gap-1.5 px-2 text-[10px] font-semibold cursor-move overflow-hidden"
                        style={{ left:`${clip.start}%`, width:`${clip.width}%`, background:`${track.color}20`, borderLeft:`2px solid ${track.color}`, color: track.color }}
                      >
                        <span>{clip.thumbnail}</span>
                        <span className="truncate">{clip.label}</span>
                      </div>
                    ))}
                    {/* Playhead */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-white/50 pointer-events-none" style={{left:`${pct}%`}}/>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-3">
          {/* Panel tabs */}
          <div className="flex gap-1 p-1 bg-[#111120] border border-white/[0.06] rounded-xl">
            {(["tools","captions","export"] as const).map(p=>(
              <button key={p} onClick={()=>setActivePanel(p)} className={cn("flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all", activePanel===p?"bg-[#6E42F5] text-white":"text-[#8B8BA8] hover:text-white")}>{p}</button>
            ))}
          </div>

          {activePanel === "tools" && (
            <div className="space-y-2">
              <p className="text-[10px] text-[#4A4A64] uppercase tracking-widest font-bold px-1">AI Editing Tools</p>
              {AI_TOOLS.map(tool => (
                <div key={tool.label} className={cn("p-3 rounded-xl border transition-all cursor-pointer group", appliedTools.includes(tool.label)?"border-[#0DCCB5]/30 bg-[#0DCCB5]/8":"border-white/[0.06] bg-[#0E0E1A] hover:border-white/[0.12]")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", appliedTools.includes(tool.label)?"bg-[#0DCCB5]/20":"bg-[#6E42F5]/12")}>
                        <tool.icon className={cn("w-4 h-4", appliedTools.includes(tool.label)?"text-[#0DCCB5]":"text-[#6E42F5]")}/>
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{tool.label}</p>
                        <p className="text-[10px] text-[#4A4A64]">{tool.desc}</p>
                        <p className="text-[10px] text-[#6E42F5] mt-0.5">{tool.action}</p>
                      </div>
                    </div>
                    <button onClick={()=>applyTool(tool.label)} className={cn("flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all", appliedTools.includes(tool.label)?"bg-[#0DCCB5] text-white":"bg-white/[0.06] text-[#8B8BA8] hover:bg-[#6E42F5] hover:text-white")}>
                      {appliedTools.includes(tool.label)?<Check className="w-3.5 h-3.5"/>:<Plus className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activePanel === "captions" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[#4A4A64] uppercase tracking-widest font-bold">Caption Settings</p>
                <Badge variant="success">Auto-synced</Badge>
              </div>
              {[
                { l:"Font", v:"Syne Bold" },
                { l:"Size", v:"72px" },
                { l:"Style", v:"Animated Pop" },
                { l:"Color", v:"White + Outline" },
                { l:"Position", v:"Lower Third" },
              ].map(s=>(
                <div key={s.l} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-xs text-[#8B8BA8]">{s.l}</span>
                  <span className="text-xs font-semibold text-[#6E42F5]">{s.v}</span>
                </div>
              ))}
              <Button variant="secondary" size="sm" className="w-full" icon={<Type className="w-3.5 h-3.5"/>}>Edit Caption Style</Button>
            </div>
          )}

          {activePanel === "export" && (
            <div className="space-y-3">
              <p className="text-[10px] text-[#4A4A64] uppercase tracking-widest font-bold">Export Presets</p>
              {EXPORT_PRESETS.map(preset => (
                <div key={preset.label} className="p-3 rounded-xl border border-white/[0.06] bg-[#0E0E1A] hover:border-[#6E42F5]/30 transition-all cursor-pointer group">
                  <p className="text-xs font-semibold mb-1">{preset.label}</p>
                  <div className="flex gap-2 text-[10px] text-[#4A4A64]">
                    <span>{preset.res}</span><span>·</span><span>{preset.fps}fps</span><span>·</span><span>{preset.format}</span>
                  </div>
                </div>
              ))}
              <Button className="w-full" size="sm" glow icon={<Download className="w-3.5 h-3.5"/>}>Export Video</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
