import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'CREOVA — AI Creator Operating System',
  description: 'Go from Idea to Viral Content in minutes. AI-powered scripts, clips, captions, thumbnails and more.',
  keywords: 'AI content creation, viral clips, script generator, thumbnail AI, CREOVA',
  openGraph: {
    title: 'CREOVA — AI Creator Operating System',
    description: 'The most powerful AI platform for content creators.',
    type: 'website',
    url: 'https://creova-ai.vercel.app',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#13132a',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
