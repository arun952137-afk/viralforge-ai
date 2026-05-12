import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { amount, plan, currency = 'INR' } = await req.json()
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    if (!key_id || !key_secret || key_id === 'rzp_live_placeholder') {
      return NextResponse.json({
        order: { id: `order_demo_${Date.now()}`, amount: amount * 100, currency },
        key_id: 'rzp_test_demo', demo: true,
      })
    }

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64')
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount * 100, currency, receipt: `creova_${plan}_${Date.now()}`, notes: { plan, product: 'CREOVA' } }),
    })
    const order = await res.json()
    if (!res.ok) return NextResponse.json({ error: order.error?.description ?? 'Order failed' }, { status: 500 })
    return NextResponse.json({ order, key_id })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
