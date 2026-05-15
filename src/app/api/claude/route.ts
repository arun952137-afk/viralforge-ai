import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { prompt, system } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || !apiKey.startsWith('sk-')) {
      console.error('[ai] OPENAI_API_KEY missing or invalid')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      )
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: system || 'You are CREOVA AI, an expert content strategist and viral content creator. Provide detailed, actionable, professional advice. Format responses clearly with sections when needed.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[ai] OpenAI error:', data)
      throw new Error(data.error?.message || 'AI generation failed')
    }

    const content = data.choices?.[0]?.message?.content ?? ''
    return NextResponse.json({ content })

  } catch (err: unknown) {
    console.error('[ai] Exception:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI error' },
      { status: 500 }
    )
  }
}
