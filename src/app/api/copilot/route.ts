import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

    const messages = [
      ...history.map((h: { role: string; content: string }) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ]

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1200,
        system: 'You are CREOVA AI Copilot — an elite content strategist who has helped 50,000+ creators grow their channels. You specialize in viral content strategy, YouTube/TikTok/Instagram growth, hook writing, competitor analysis, monetization, and trend forecasting. Give specific, actionable advice. Be direct, confident, and strategic. Use data and examples.',
        messages,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'AI error')
    return NextResponse.json({ content: data.content?.[0]?.text ?? '' })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
