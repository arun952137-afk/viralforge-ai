import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { niche, platform, duration, tone } = body;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: `Write a viral ${platform} script for "${niche}" niche, ${duration}s, tone: ${tone}. Return JSON with: hook, body, cta, fullScript, scenes(array with id/description/text/duration/visualPrompt), hashtags, seoTitle, seoDescription, viralScore(0-100), wordCount, estimatedDuration. JSON only.`
        }],
        response_format: { type: "json_object" },
        temperature: 0.8,
      }),
    });

    if (!res.ok) throw new Error("OpenAI error");
    const data = await res.json();
    const scriptData = JSON.parse(data.choices[0].message.content);
    return NextResponse.json({ success: true, data: { scriptData } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Script generation failed" }, { status: 500 });
  }
}
