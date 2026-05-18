import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, topic, platform } = body;

    const prompts: Record<string, string> = {
      enhance: `Enhance this content idea for maximum viral potential on ${platform}: "${topic}". Return JSON: { "enhanced": "2-3 sentence enhanced prompt" }`,
      hooks: `Generate 10 viral hooks for "${topic}" on ${platform}. Return JSON: { "hooks": [{"hook":"...","type":"curiosity|shock|emotion","score":90}] }`,
      hashtags: `Generate optimized hashtags for "${topic}" on ${platform}. Return JSON: { "hashtags":["#tag"],"trending":["#tag"],"niche":["#tag"] }`,
      trends: `Top 5 viral content trends for ${topic} niche right now. Return JSON: { "trends":[{"title":"...","hook":"...","viralScore":90,"reason":"..."}],"trendingAudio":["..."],"bestTime":"..." }`,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompts[action] ?? prompts.enhance }],
        response_format: { type: "json_object" },
        temperature: 0.8,
      }),
    });

    if (!res.ok) throw new Error("AI error");
    const data = await res.json();
    return NextResponse.json({ success: true, data: JSON.parse(data.choices[0].message.content) });
  } catch {
    return NextResponse.json({ success: false, error: "AI generation failed" }, { status: 500 });
  }
}
