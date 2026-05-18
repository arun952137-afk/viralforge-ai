"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Sparkles, Copy, Check, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { Button, Card, Textarea, Badge, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

const FORMATS = [
  { id: "tiktok", label: "TikTok Script", icon: "🎵", color: "#00F2EA", desc: "Viral short-form with trending hooks" },
  { id: "reels", label: "Instagram Reel", icon: "📸", color: "#E1306C", desc: "Visual storytelling format" },
  { id: "shorts", label: "YouTube Short", icon: "▶️", color: "#FF0000", desc: "Discovery-optimized script" },
  { id: "linkedin", label: "LinkedIn Post", icon: "💼", color: "#0077B5", desc: "Professional thought leadership" },
  { id: "twitter", label: "X Thread", icon: "🐦", color: "#1DA1F2", desc: "Viral thread format" },
  { id: "carousel", label: "Carousel", icon: "🎠", color: "#6E42F5", desc: "Swipeable slide content" },
  { id: "newsletter", label: "Newsletter", icon: "📧", color: "#F5A623", desc: "Email-optimized summary" },
  { id: "blog", label: "Blog Article", icon: "📝", color: "#0DCCB5", desc: "SEO-friendly long-form" },
  { id: "podcast", label: "Podcast Clips", icon: "🎙️", color: "#8B62FF", desc: "Audio-first snippets" },
  { id: "captions", label: "Caption Variants", icon: "💬", color: "#F5426E", desc: "10 platform-optimized captions" },
];

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(text).catch(()=>{}); setC(true); setTimeout(()=>setC(false),1500)}} className="p-1.5 rounded-lg text-[#4A4A64] hover:text-[#6E42F5] hover:bg-[#6E42F5]/10 transition-all flex-shrink-0">
      {c?<Check className="w-3.5 h-3.5 text-[#0DCCB5]"/>:<Copy className="w-3.5 h-3.5"/>}
    </button>
  );
}

const MOCK: Record<string, string> = {
  tiktok: "🔥 HOOK: Nobody tells you this about [topic]…\n\n[3-second visual reveal]\n\nHere's what actually happens when you [action] — and why it changes EVERYTHING:\n\n1. First, [insight]\n2. Then, [escalation]\n3. The twist? [revelation]\n\nSave this before it disappears 👇\n\n#fyp #viral #[niche]",
  reels: "🎬 REEL SCRIPT (30s)\n\n[0-3s] Hook visual: [opening scene]\nVO: 'What if [topic] could change everything?'\n\n[3-15s] Build: [show the process/story]\n\n[15-25s] Payoff: [the reveal or result]\n\n[25-30s] CTA: 'Save + Follow for more 🔖'\n\n[Music: trending audio recommended]",
  linkedin: "Most people get [topic] completely wrong.\n\nHere's what 3 years of experience taught me:\n\n→ [Insight #1]\n→ [Insight #2]\n→ [Insight #3]\n\nThe uncomfortable truth?\n\n[Core revelation here]\n\nThis is why [outcome/implication].\n\nWhat's your take? Drop it below 👇\n\n#[niche] #CreatorEconomy #ContentStrategy",
  twitter: "🧵 Thread: The [topic] truth nobody talks about\n\n1/ I spent [time] studying [topic]. Here's what actually works:\n\n2/ First, [insight with example]\n\n3/ The mistake everyone makes: [common error]\n\n4/ What to do instead: [solution]\n\n5/ The result? [outcome]\n\n6/ TL;DR:\n• [point 1]\n• [point 2]\n• [point 3]\n\nRT if this helped 🙏",
  newsletter: "Subject: The [topic] secret I wish I knew earlier\n\nHey [Name],\n\nQuick story.\n\nLast week, I was [relatable situation]. And I noticed something most creators miss:\n\n[Core insight from your content]\n\nHere's why this matters for you:\n\n1. [Benefit 1]\n2. [Benefit 2]\n3. [Benefit 3]\n\nAction step this week: [specific CTA]\n\n— [Your name]",
  blog: "# The Complete Guide to [Topic]: Everything Creators Need to Know\n\n## Introduction\nMost creators struggle with [topic]. But it doesn't have to be this way.\n\n## What Nobody Tells You About [Topic]\n[Core insight expanded into 2-3 paragraphs]\n\n## Step-by-Step Breakdown\n### Step 1: [First action]\n### Step 2: [Second action]\n### Step 3: [Third action]\n\n## Common Mistakes to Avoid\n[List of pitfalls]\n\n## Conclusion\n[Summary + CTA]",
  captions: "Caption 1 (Curiosity): Nobody told me [topic] would change everything…\n\nCaption 2 (Results): From 0 to [result] using this one [topic] strategy\n\nCaption 3 (Story): The day I discovered [topic] and why nothing was the same\n\nCaption 4 (Authority): After [X] years studying [topic], here's what I know\n\nCaption 5 (Urgency): This [topic] opportunity closes in 48 hours\n\nCaption 6 (Controversy): The [topic] 'experts' are getting completely wrong\n\nCaption 7 (Value): Free [topic] framework that took me 2 years to build\n\nCaption 8 (Emotion): I almost quit [topic] until I learned this\n\nCaption 9 (Community): Everyone who does [topic] knows this feeling\n\nCaption 10 (Curiosity-gap): The [topic] mistake that cost me [X]",
};

export default function RepurposePage() {
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});
  const [activeResult, setActiveResult] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  async function repurpose() {
    if (!content.trim() || selected.length === 0) return;
    setLoading(true);
    // Simulate AI generation for each selected format
    await new Promise(r => setTimeout(r, 1800));
    const out: Record<string, string> = {};
    selected.forEach(id => { out[id] = MOCK[id] ?? `[AI-generated ${id} content based on your input]`; });
    setResults(out);
    setActiveResult(selected[0]);
    setLoading(false);
  }

  const allSelected = selected.length === FORMATS.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight mb-1">Repurpose Studio</h1>
        <p className="text-[#8B8BA8] text-sm">One idea → 10 platform-optimized content formats. Post everywhere without extra work.</p>
      </div>

      {/* Input */}
      <Card className="p-5">
        <Textarea
          label="Your Original Content or Idea"
          value={content}
          onChange={e=>setContent(e.target.value)}
          placeholder="Paste your video script, blog post, idea, or any content you want to repurpose across platforms…"
          rows={5}
        />
        <div className="mt-2 flex items-center gap-2 text-xs text-[#4A4A64]">
          <span>{content.length} characters</span>
          {content.length > 100 && <Badge variant="success">Ready to repurpose</Badge>}
        </div>
      </Card>

      {/* Format selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Select Output Formats</p>
          <button onClick={()=>setSelected(allSelected?[]:FORMATS.map(f=>f.id))} className="text-xs text-[#6E42F5] font-semibold hover:text-[#8B62FF]">
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {FORMATS.map(f=>(
            <motion.div
              key={f.id}
              whileHover={{y:-2}}
              whileTap={{scale:0.97}}
              onClick={()=>toggle(f.id)}
              className={cn("cursor-pointer rounded-xl border p-3 transition-all duration-200", selected.includes(f.id)?"border-[#6E42F5]/50 shadow-[0_0_16px_rgba(110,66,245,0.2)]":"border-white/[0.06] hover:border-white/[0.12]")}
              style={selected.includes(f.id)?{background:`${f.color}10`}:{background:"#0E0E1A"}}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{f.icon}</span>
                {selected.includes(f.id) && <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{background:f.color}}><Check className="w-2.5 h-2.5 text-white"/></div>}
              </div>
              <p className="text-xs font-semibold leading-tight mb-0.5">{f.label}</p>
              <p className="text-[10px] text-[#4A4A64] leading-tight">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <Button
        onClick={repurpose}
        loading={loading}
        disabled={!content.trim() || selected.length === 0}
        size="lg"
        glow
        icon={<Sparkles className="w-5 h-5"/>}
        className="w-full"
      >
        {loading ? `Generating ${selected.length} formats…` : `Repurpose into ${selected.length} Format${selected.length!==1?"s":""}`}
      </Button>

      {/* Results */}
      <AnimatePresence>
        {Object.keys(results).length > 0 && (
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base">Generated Content</h3>
              <Badge variant="success">{Object.keys(results).length} formats ready</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(results).map(id=>{
                const fmt = FORMATS.find(f=>f.id===id)!;
                return (
                  <button key={id} onClick={()=>setActiveResult(id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all", activeResult===id?"text-white border-transparent":"border-white/[0.08] text-[#8B8BA8] hover:text-white")} style={activeResult===id?{background:fmt?.color,boxShadow:`0 0 12px ${fmt?.color}50`}:{}}>
                    {fmt?.icon} {fmt?.label}
                  </button>
                );
              })}
            </div>
            {activeResult && results[activeResult] && (
              <motion.div key={activeResult} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}}>
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{FORMATS.find(f=>f.id===activeResult)?.icon}</span>
                      <h4 className="font-display font-bold text-base">{FORMATS.find(f=>f.id===activeResult)?.label}</h4>
                    </div>
                    <div className="flex gap-2">
                      <CopyBtn text={results[activeResult]}/>
                      <Button size="xs" variant="secondary" icon={<RefreshCw className="w-3 h-3"/>}>Regenerate</Button>
                    </div>
                  </div>
                  <pre className="text-sm text-[#8B8BA8] leading-relaxed whitespace-pre-wrap font-sans bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">
                    {results[activeResult]}
                  </pre>
                  <div className="flex gap-3 mt-4">
                    <Button size="sm" icon={<Zap className="w-3.5 h-3.5"/>}>Publish Now</Button>
                    <Button variant="secondary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5"/>}>Schedule</Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!Object.keys(results).length && !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-3xl bg-[#6E42F5]/10 border border-[#6E42F5]/20 flex items-center justify-center mx-auto mb-5">
            <Layers className="w-10 h-10 text-[#6E42F5]"/>
          </div>
          <h3 className="font-display font-bold text-xl mb-2">One Input, Ten Outputs</h3>
          <p className="text-[#8B8BA8] text-sm max-w-sm mx-auto">Paste any content, select your platforms, and get perfectly formatted posts for each channel — instantly.</p>
        </div>
      )}
    </div>
  );
}
