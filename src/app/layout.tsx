import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Orizon Fleet Coordinator | Multi-Agent AMR Deployment Platform',
  description: '4 AI agents — LangGraph, CrewAI, PydanticAI, AnthropicAdapter — coordinate through Band to deploy autonomous mobile robot fleets with safety veto loops, RAG-powered robot selection, and human-in-the-loop approval. Powered by Featherless AI open-source models.',
  keywords: ['AMR', 'fleet deployment', 'multi-agent', 'Band', 'Featherless AI', 'robotics', 'autonomous mobile robots', 'LangGraph', 'CrewAI', 'PydanticAI', 'agentic mesh', 'ISO 3691-4'],
  openGraph: {
    title: 'Orizon Fleet Coordinator — Where AI Agents Deploy Robot Fleets',
    description: '4 cross-framework AI agents coordinate through Band to transform a 5-15 day fleet deployment process into a 10-minute orchestrated workflow.',
    type: 'website',
  },
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
