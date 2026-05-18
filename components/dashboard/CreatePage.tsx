"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, FileText, Mic, Video, Scissors, Image as ImageIcon,
  Tag, Upload, ChevronRight, ChevronLeft, Check, RefreshCw,
  Wand2, Play, Zap, Copy
} from "lucide-react";
import { Button, Card, Input, Textarea, Select, Badge, Progress, ScoreRing } from "@/components/ui";
import { cn } from "@/lib/utils";

/* ── STEPS ────────────────────────────────────────────────────────────── */
const STEPS = [
  { id: "idea", label: "Idea", icon: Sparkles },
  { id: "script", label: "Script", icon: FileText },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "video", label: "Video", icon: Video },
  { id: "edit", label: "Edit", icon: Scissors },
  { id: "thumbnail", label: "Thumbnail", icon: ImageIcon },
  { id: "seo", label: "SEO", icon: Tag },
  { id: "publish", label: "Publish", icon: Upload },
];

/* ── STEP INDICATOR ───────────────────────────────────────────────────── */
function StepBar({ steps, current }: { steps: typeof STEPS; current: number }) {
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2 scrollbar-none">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center shrink-0">
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 text-xs font-semibold",
            i === current
              ? "bg-brand/12 text-brand-light border border-brand/25"
              : i < current
              ? "text-accent-teal"
              : "text-ink-disabled"
          )}>
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
              i < current
                ? "bg-accent-teal text-canvas"
                : i === current
                ? "bg-brand text-white"
                : "bg-surface-DEFAULT text-ink-disabled"
            )}>
              {i < current ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className="hidden sm:block">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("w-6 h-px mx-0.5", i < current ? "bg-accent-teal/40" : "bg-surface-border")} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── IDEA STEP ────────────────────────────────────────────────────────── */
function IdeaStep({ data, onChange, onNext }: any) {
  const [enhancing, setEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState("");

  async function enhance() {
    if (!data.niche && !data.idea) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enhance", topic: data.idea || data.niche, platform: data.platform }),
      });
      const result = await res.json();
      if (result.success) setEnhanced(result.data.enhanced);
      else throw new Error();
    } catch {
      setEnhanced(`Create a high-retention ${data.platform} video about "${data.niche || data.idea}" — viral pacing, strong emotional hook in first 2 seconds, clear story arc, platform-optimized formatting, and a compelling CTA that drives follows and saves.`);
    }
    setEnhancing(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">What's your video about?</h2>
        <p className="text-ink-secondary text-sm">Describe your idea. AI will enhance it for maximum viral potential.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Platform"
          value={data.platform}
          onChange={(v) => onChange({ ...data, platform: v })}
          options={[
            { value: "YouTube Shorts", label: "YouTube Shorts" },
            { value: "TikTok", label: "TikTok" },
            { value: "Instagram Reels", label: "Instagram Reels" },
          ]}
        />
        <Select
          label="Niche"
          value={data.niche}
          onChange={(v) => onChange({ ...data, niche: v })}
          options={[
            { value: "kids", label: "Kids Animation" },
            { value: "education", label: "Education" },
            { value: "finance", label: "Finance" },
            { value: "motivation", label: "Motivation" },
            { value: "gaming", label: "Gaming" },
            { value: "fitness", label: "Fitness" },
            { value: "tech", label: "Tech & AI" },
            { value: "comedy", label: "Comedy" },
          ]}
        />
      </div>

      <Textarea
        label="Your Idea"
        value={data.idea}
        onChange={(e) => onChange({ ...data, idea: e.target.value })}
        placeholder="Describe what you want to create…"
        rows={4}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select label="Duration" value={data.duration} onChange={(v) => onChange({ ...data, duration: v })}
          options={[
            { value: "30", label: "30 seconds" },
            { value: "60", label: "60 seconds" },
            { value: "90", label: "90 seconds" },
          ]}
        />
        <Select label="Tone" value={data.tone} onChange={(v) => onChange({ ...data, tone: v })}
          options={[
            { value: "energetic", label: "Energetic" },
            { value: "dramatic", label: "Dramatic" },
            { value: "educational", label: "Educational" },
            { value: "funny", label: "Comedy" },
            { value: "inspiring", label: "Inspiring" },
          ]}
        />
      </div>

      {enhanced && (
        <div className="p-4 rounded-xl bg-brand/6 border border-brand/18">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-3.5 h-3.5 text-brand-light" />
            <p className="text-[11px] font-bold text-brand-light uppercase tracking-wider">AI Enhanced</p>
          </div>
          <p className="text-sm text-ink-secondary leading-relaxed">{enhanced}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={enhance}
          loading={enhancing}
          icon={<Wand2 className="w-4 h-4" />}
          disabled={!data.idea && !data.niche}
        >
          {enhancing ? "Enhancing…" : "AI Enhance Prompt"}
        </Button>
        <Button
          onClick={onNext}
          disabled={!data.niche}
          icon={<ChevronRight className="w-4 h-4" />}
          glow
        >
          Generate Script
        </Button>
      </div>
    </div>
  );
}

/* ── SCRIPT STEP ─────────────────────────────────────────────────────── */
function ScriptStep({ ideaData, scriptData, setScriptData, onNext, onBack }: any) {
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: ideaData.idea || ideaData.niche, platform: ideaData.platform, duration: parseInt(ideaData.duration), tone: ideaData.tone }),
      });
      const data = await res.json();
      if (data.success) setScriptData(data.data.scriptData);
      else throw new Error();
    } catch {
      setScriptData({
        hook: "What if one balloon could literally change your entire life? 🎈",
        hookVariants: ["Nobody talks about this balloon — but it changes everything…", "The golden balloon that took Johnny to another world…"],
        body: "Johnny was just a regular kid until the day he found the golden balloon at the edge of the park. The moment his fingers touched the silky surface, everything changed. Colors deepened. Sound became music. He was floating — high above the clouds — into a world where every dream was real.",
        cta: "Subscribe to follow Johnny's next adventure! Drop a 🎈 if you believe in magic!",
        scenes: [
          { id: 1, description: "Park scene — golden balloon appears", text: "What if one balloon could change everything?", duration: 4, visualPrompt: "Pixar-quality park, golden glowing balloon, cinematic lighting" },
          { id: 2, description: "Johnny reaches for the balloon", text: "Johnny's fingers touched the silky surface…", duration: 6, visualPrompt: "Close-up hand touching glowing balloon, sparkle effects, bokeh" },
          { id: 3, description: "Floating up through clouds", text: "And suddenly, he was floating above the world.", duration: 10, visualPrompt: "Kid rising through colorful clouds, rainbow trails, magical sky kingdom" },
          { id: 4, description: "Cloud kingdom revealed", text: "…into a world where every dream was real.", duration: 14, visualPrompt: "Breathtaking magical cloud city, rainbow bridges, Pixar quality" },
          { id: 5, description: "CTA end card", text: "Subscribe for Johnny's next adventure!", duration: 6, visualPrompt: "Character waving at camera, subscribe animation" },
        ],
        hashtags: ["#KidsYouTube", "#Animation", "#ViralShorts", "#MagicBalloon"],
        seoTitle: "🎈 The MAGICAL Golden Balloon | Kids Adventure 2025",
        seoDescription: "Join Johnny on the most incredible balloon adventure! Cloud kingdoms, rainbow bridges, and pure magic. New episodes every Saturday!",
        viralScore: 91,
        wordCount: 78,
        estimatedDuration: 55,
      });
    }
    setLoading(false);
  }

  if (!scriptData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">Generate Script</h2>
          <p className="text-ink-secondary text-sm">AI creates a retention-optimized script with hooks, scenes, and CTAs.</p>
        </div>
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-brand-light" />
          </div>
          <p className="text-ink-secondary mb-6 text-sm">
            Ready to write your script for <span className="text-ink-DEFAULT font-semibold">"{ideaData.niche}"</span> on {ideaData.platform}
          </p>
          <Button onClick={generate} loading={loading} size="lg" icon={<Sparkles className="w-4 h-4" />} glow>
            {loading ? "Writing Script…" : "Generate with AI"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">Your Script</h2>
          <p className="text-ink-secondary text-sm">Review and refine your AI-generated script.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            <ScoreRing value={scriptData.viralScore} label="Viral" size={56} />
          </div>
          <Button variant="secondary" size="sm" onClick={generate} loading={loading} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Regenerate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Script sections */}
        <div className="space-y-3">
          {[
            { label: "Hook (0–3s)", text: scriptData.hook, color: "#6E42F5", dot: "bg-brand" },
            { label: "Body", text: scriptData.body, color: "#42B4F5", dot: "bg-accent-sky" },
            { label: "CTA", text: scriptData.cta, color: "#0DCCB5", dot: "bg-accent-teal" },
          ].map((section) => (
            <Card key={section.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${section.dot}`} />
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: section.color }}>{section.label}</p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(section.text).catch(() => {})}
                  className="text-ink-disabled hover:text-ink-tertiary transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm text-ink-secondary leading-relaxed">{section.text}</p>
            </Card>
          ))}

          <div className="flex gap-2">
            <Badge variant="sky">{scriptData.wordCount} words</Badge>
            <Badge variant="brand">{scriptData.estimatedDuration}s</Badge>
          </div>
        </div>

        {/* Scenes */}
        <div>
          <p className="text-[11px] text-ink-tertiary font-bold uppercase tracking-widest mb-3">Scenes ({scriptData.scenes?.length})</p>
          <div className="space-y-2">
            {scriptData.scenes?.map((scene: any) => (
              <Card key={scene.id} className="p-3 hover:border-surface-border-strong transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-brand-light">Scene {scene.id}</p>
                  <Badge variant="sky">{scene.duration}s</Badge>
                </div>
                <p className="text-xs font-medium mb-1">{scene.description}</p>
                <p className="text-xs text-ink-tertiary italic">"{scene.text}"</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} icon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
        <Button onClick={onNext} icon={<ChevronRight className="w-4 h-4" />} glow>Generate Voiceover</Button>
      </div>
    </div>
  );
}

/* ── SIMPLIFIED STEPS ─────────────────────────────────────────────────── */
function SimpleStep({ title, desc, icon: Icon, color, onNext, onBack, nextLabel, content }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">{title}</h2>
        <p className="text-ink-secondary text-sm">{desc}</p>
      </div>
      {content}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} icon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
        <Button onClick={onNext} icon={<ChevronRight className="w-4 h-4" />} glow>{nextLabel ?? "Continue"}</Button>
      </div>
    </div>
  );
}

/* ── PUBLISH STEP ─────────────────────────────────────────────────────── */
function PublishStep({ onBack }: any) {
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState(false);

  async function publish() {
    setPublishing(true);
    await new Promise(r => setTimeout(r, 2800));
    setDone(true);
    setPublishing(false);
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-6">
        <div className="w-20 h-20 rounded-full bg-accent-teal/15 border border-accent-teal/25 flex items-center justify-center mx-auto">
          <span className="text-4xl">🎉</span>
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold mb-2">Video is live!</h2>
          <p className="text-ink-secondary">Published across all connected platforms. Watch the views roll in.</p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" icon={<BarChart className="w-4 h-4" />}>View Analytics</Button>
          <Button icon={<Zap className="w-4 h-4" />} glow onClick={() => window.location.reload()}>Create Another</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">Publish Your Video</h2>
        <p className="text-ink-secondary text-sm">Choose platforms and timing for maximum reach.</p>
      </div>

      <Card>
        <p className="text-[11px] font-bold text-ink-tertiary uppercase tracking-widest mb-4">Platform Connections</p>
        <div className="space-y-3">
          {[
            { name: "YouTube Shorts", icon: "▶", connected: true },
            { name: "TikTok", icon: "♪", connected: true },
            { name: "Instagram Reels", icon: "◈", connected: false },
          ].map(p => (
            <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-surface-DEFAULT border border-surface-border">
              <div className="flex items-center gap-3">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
              <Badge variant={p.connected ? "success" : "default"}>{p.connected ? "Connected" : "Connect"}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-[11px] font-bold text-ink-tertiary uppercase tracking-widest mb-3">AI Recommendation</p>
        <div className="p-3 bg-accent-teal/8 border border-accent-teal/20 rounded-xl">
          <p className="text-sm font-semibold text-accent-teal mb-0.5">Saturday 3:00 PM EST</p>
          <p className="text-xs text-ink-tertiary">+43% more initial views vs. off-peak — based on your audience data</p>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} icon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
        <Button onClick={publish} loading={publishing} size="lg" icon={<Upload className="w-4 h-4" />} glow>
          {publishing ? "Publishing…" : "🚀 Publish Now"}
        </Button>
      </div>
    </div>
  );
}

// Small import fix
import { BarChart } from "lucide-react";

/* ── PAGE ─────────────────────────────────────────────────────────────── */
export default function CreatePage() {
  const [step, setStep] = useState(0);
  const [ideaData, setIdeaData] = useState({ idea: "", niche: "kids", platform: "YouTube Shorts", duration: "60", tone: "energetic" });
  const [scriptData, setScriptData] = useState<any>(null);

  const STEP_CONTENT = [
    <IdeaStep key="idea" data={ideaData} onChange={setIdeaData} onNext={() => setStep(1)} />,
    <ScriptStep key="script" ideaData={ideaData} scriptData={scriptData} setScriptData={setScriptData} onNext={() => setStep(2)} onBack={() => setStep(0)} />,
    <SimpleStep key="voice" title="Voice Studio" desc="Choose your AI voice and generate the narration." icon={Mic} color="#42B4F5" onNext={() => setStep(3)} onBack={() => setStep(1)} nextLabel="Generate Video"
      content={
        <Card>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {["Rachel — Calm, Professional", "Domi — Strong, Narrative", "Aria — Energetic, Youthful", "Josh — Casual, Relatable", "Antoni — Deep, Cinematic", "Bella — Warm, Friendly"].map((v, i) => (
              <div key={v} className={`p-3 rounded-xl border cursor-pointer transition-all ${i === 0 ? "border-brand/40 bg-brand/8" : "border-surface-border hover:border-surface-border-strong"}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-accent-sky flex items-center justify-center text-xs font-bold text-white mb-2">{v[0]}</div>
                <p className="text-xs font-semibold leading-tight">{v.split(" — ")[0]}</p>
                <p className="text-[10px] text-ink-tertiary">{v.split(" — ")[1]}</p>
              </div>
            ))}
          </div>
          <div className="h-12 bg-surface-DEFAULT rounded-xl flex items-center px-4 gap-3">
            <button className="w-8 h-8 rounded-full bg-brand flex items-center justify-center flex-shrink-0"><Play className="w-3 h-3 text-white ml-0.5" /></button>
            <div className="flex-1 flex items-center gap-0.5 h-6">
              {Array.from({length:48}, (_,i) => <div key={i} className="flex-1 rounded-full bg-brand/40" style={{height:`${30+Math.sin(i*0.5)*50}%`}} />)}
            </div>
            <span className="text-xs text-ink-tertiary">0:54</span>
          </div>
        </Card>
      }
    />,
    <SimpleStep key="video" title="AI Video Generation" desc="Generating scenes using Runway and Kling AI." icon={Video} color="#F5A623" onNext={() => setStep(4)} onBack={() => setStep(2)} nextLabel="Open Editor"
      content={
        <div className="space-y-3">
          {scriptData?.scenes?.map((s: any, i: number) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Scene {s.id}: {s.description}</p>
                <Badge variant={i < 2 ? "success" : i === 2 ? "warning" : "default"}>{i < 2 ? "✓ Done" : i === 2 ? "Generating…" : "Queued"}</Badge>
              </div>
              <Progress value={i < 2 ? 100 : i === 2 ? 62 : 0} variant={i < 2 ? "teal" : "brand"} />
            </Card>
          ))}
        </div>
      }
    />,
    <SimpleStep key="edit" title="Timeline Editor" desc="Trim clips, add captions, transitions, and beat sync." icon={Scissors} color="#F5426E" onNext={() => setStep(5)} onBack={() => setStep(3)} nextLabel="Generate Thumbnail"
      content={
        <Card className="h-48 flex items-center justify-center border-2 border-dashed border-brand/20">
          <div className="text-center">
            <Scissors className="w-10 h-10 text-ink-disabled mx-auto mb-3" />
            <p className="text-sm text-ink-secondary">Remotion-powered timeline editor</p>
            <p className="text-xs text-ink-tertiary mt-1">Drag clips · Subtitles · Transitions · Beat sync</p>
          </div>
        </Card>
      }
    />,
    <SimpleStep key="thumb" title="AI Thumbnail" desc="Generate click-optimized thumbnails with CTR prediction." icon={ImageIcon} color="#42B4F5" onNext={() => setStep(6)} onBack={() => setStep(4)} nextLabel="Generate SEO"
      content={
        <div className="grid grid-cols-3 gap-4">
          {[91, 84, 78].map((score, i) => (
            <div key={i} className={`relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${i === 0 ? "border-brand shadow-brand-sm" : "border-surface-border hover:border-surface-border-strong"}`}
              style={{ background: `linear-gradient(135deg, ${["#6E42F5","#F5426E","#0DCCB5"][i]}20, #0E0E1A)` }}>
              {i === 0 && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white font-semibold">Variant {i+1}</span>
                  <span className="text-[10px] font-bold text-accent-teal">CTR {score}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
    />,
    <SimpleStep key="seo" title="SEO & Metadata" desc="Platform-optimized titles, descriptions, and hashtags." icon={Tag} color="#0DCCB5" onNext={() => setStep(7)} onBack={() => setStep(5)} nextLabel="Publish"
      content={
        <div className="space-y-4">
          <Input label="Title" defaultValue={scriptData?.seoTitle ?? "🎈 The MAGICAL Golden Balloon | Kids Adventure 2025"} fullWidth />
          <Textarea label="Description" defaultValue={scriptData?.seoDescription ?? "Join Johnny on the most incredible balloon adventure!"} rows={3} />
          <div className="flex flex-wrap gap-2">{(scriptData?.hashtags ?? ["#KidsYouTube","#Animation","#ViralShorts"]).map((h: string) => <Badge key={h} variant="brand">{h}</Badge>)}</div>
        </div>
      }
    />,
    <PublishStep key="publish" onBack={() => setStep(6)} />,
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <StepBar steps={STEPS} current={step} />
      <Card>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {STEP_CONTENT[step]}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}
