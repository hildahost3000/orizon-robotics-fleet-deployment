import type { Metadata } from 'next'
import { Cormorant_Garamond, Instrument_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
})

const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-instrument',
})

export const metadata: Metadata = {
  title: 'Orizon Fleet Coordinator | Multi-Agent AMR Deployment',
  description:
    'Four AI agents coordinate through Band to deploy AMR fleets — site assessment, fleet config, safety veto, launch package.',
  keywords: [
    'AMR',
    'fleet deployment',
    'multi-agent',
    'Band',
    'Featherless AI',
    'robotics',
    'LangGraph',
    'CrewAI',
    'PydanticAI',
  ],
  openGraph: {
    title: 'Orizon Fleet Coordinator',
    description: 'Multi-agent AMR deployment on Band — assess, configure, veto, launch.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${instrument.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
