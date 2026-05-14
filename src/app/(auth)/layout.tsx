import Link from 'next/link'
export const dynamic = 'force-dynamic'
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(124,58,237,0.14) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <nav style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 28px', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 2 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--grad2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Syne', fontWeight: 900, fontSize: 13, boxShadow: '0 0 16px rgba(124,58,237,.5)' }}>C</div>
          <span className="syne" style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>CREOVA</span>
        </Link>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}
