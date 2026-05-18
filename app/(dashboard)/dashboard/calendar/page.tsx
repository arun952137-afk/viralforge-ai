"use client";
import { Card, Button } from "@/components/ui";
import { Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="text-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-6 h-6 text-brand-light" />
        </div>
        <h2 className="font-display text-xl font-bold mb-2">Full module in production</h2>
        <p className="text-ink-secondary text-sm mb-6 max-w-sm mx-auto">This module is fully built with real AI integrations, live data, and premium UI in the complete codebase.</p>
        <Link href="/dashboard/create"><Button icon={<ArrowRight className="w-4 h-4" />} glow>Try Create Video</Button></Link>
      </Card>
    </div>
  );
}
