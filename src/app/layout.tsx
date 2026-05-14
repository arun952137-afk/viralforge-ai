import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'CREOVA — AI Creator Operating System',
  description: 'The most advanced AI platform for content creators. Scripts, viral clips, competitor intelligence, brand building and more.',
  keywords: 'AI content creation, viral clips, CREOVA, AI studio, creator tools',
  openGraph: {
    title: 'CREOVA — AI Creator Operating System',
    description: 'Go from idea to viral content in minutes.',
    url: 'https://viralforge-ai-six.vercel.app',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster position="bottom-right" toastOptions={{
          style: { background: '#0b1023', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 14 },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }} />
        <Analytics />
      </body>
    </html>
  )
}
