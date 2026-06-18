import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Orizon Fleet Coordinator | Multi-Agent AMR Deployment',
  description: 'AI-powered multi-agent system for autonomous mobile robot fleet deployment coordination. 4 specialized agents collaborate through Band to produce safety-cleared deployment packages.',
  keywords: ['AMR', 'fleet deployment', 'multi-agent', 'Band', 'Featherless AI', 'robotics', 'autonomous mobile robots'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
