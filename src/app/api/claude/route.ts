import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { prompt, system } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY

    // Detailed error to help debug
    if (!apiKey) {
      console.error('[claude] ANTHROPIC_API_KEY is missing or empty')
      return NextResponse.json(
        { error: 'AI service not configured — API key missing' },
        { status: 503 }
      )
    }

    if (!apiKey.startsWith('sk-ant-')) {
      console.error('[claude] ANTHROPIC_API_KEY has invalid format:', apiKey.substring(0, 10) + '...')
      return NextResponse.json(
        { error: 'AI service not configured — invalid API key format' },
        { status: 503 }
      )
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2000,
        system: system || 'You are CREOVA AI, an expert content strategist and viral content creator. Provide detailed, actionable, professional advice. Format responses clearly with sections when needed.',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[claude] Anthropic API error:', data)
      throw new Error(data.error?.message || 'AI generation failed')
    }

    const content = data.content?.[0]?.text ?? ''
    return NextResponse.json({ content })

  } catch (err: unknown) {
    console.error('[claude] Exception:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI error' },
      { status: 500 }
    )
  }
}
