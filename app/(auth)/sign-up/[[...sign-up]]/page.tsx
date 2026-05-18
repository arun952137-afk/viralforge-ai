import { SignUp } from "@clerk/nextjs";
export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 bg-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
      <div className="relative space-y-6 w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span className="font-display font-bold text-xl">ViralForge AI</span>
        </div>
        <p className="text-ink-tertiary text-sm">3 free videos/day — no credit card needed</p>
        <SignUp />
      </div>
    </div>
  );
}
