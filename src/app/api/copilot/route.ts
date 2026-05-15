import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || !apiKey.startsWith('sk-')) {
      console.error('[copilot] OPENAI_API_KEY missing or invalid')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }

    const messages = [
      {
        role: 'system',
        content: 'You are CREOVA AI Copilot — an elite content strategist who has helped 50,000+ creators grow their channels. You specialise in viral content strategy, YouTube/TikTok/Instagram growth, hook writing, competitor analysis, monetization, and trend forecasting. Give specific, actionable advice. Be direct, confident, and strategic.',
      },
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: message },
    ]

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1200,
        messages,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'AI error')

    const content = data.choices?.[0]?.message?.content ?? ''
    return NextResponse.json({ content })

  } catch (err: unknown) {
    console.error('[copilot] Exception:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI error' },
      { status: 500 }
    )
  }
}
