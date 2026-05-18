import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Configure Stripe keys in .env" }, { status: 501 });
}
export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Configure Stripe keys in .env" }, { status: 501 });
}
