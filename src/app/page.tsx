'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const AGENTS = [
  { name: 'Site Assessor', framework: 'LangGraph', model: 'Qwen2.5-32B', color: '#3b82f6', role: 'Parses factory specs, flags infrastructure gaps' },
  { name: 'Fleet Configurator', framework: 'CrewAI + RAG', model: 'Llama-3.1-70B', color: '#8b5cf6', role: 'Robot selection, waypoint planning, charging schedules' },
  { name: 'Safety Reviewer', framework: 'PydanticAI', model: 'DeepSeek-R1', color: '#ef4444', role: 'ISO 3691-4 compliance with VETO authority' },
  { name: 'Launch Coordinator', framework: 'AnthropicAdapter', model: 'Qwen2.5-72B', color: '#10b981', role: 'Synthesizes deployment-ready package' },
]

const WORKFLOW_STEPS = [
  { step: 1, label: 'Assess', desc: 'Site Assessor analyzes factory floor plan, Wi-Fi coverage, ramp gradients', icon: '1' },
  { step: 2, label: 'Configure', desc: 'Fleet Configurator selects robots via RAG, assigns zones and waypoints', icon: '2' },
  { step: 3, label: 'Review', desc: 'Safety Reviewer checks ISO compliance — can VETO and force revision', icon: '3' },
  { step: 4, label: 'Package', desc: 'Launch Coordinator synthesizes final deployment plan for approval', icon: '4' },
]

const STATS = [
  { value: '4', label: 'AI Agents' },
  { value: '4', label: 'Frameworks' },
  { value: '4', label: 'LLM Models' },
  { value: '6', label: 'Fleet Robots' },
]

export default function LandingPage() {
  const [activeAgent, setActiveAgent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % AGENTS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-fleet-dark overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/3 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-4 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">Orizon</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://github.com/hildahost3000/band-of-agents" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
            GitHub
          </a>
          <a href="https://docs.band.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5">
            Band Docs
          </a>
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 transition-all"
          >
            Launch Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-blue-300">Band of Agents Hackathon 2026</span>
          <span className="text-xs text-gray-500">|</span>
          <span className="text-xs text-purple-300">Track 1: Enterprise Workflows</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Where AI Agents
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Deploy Robot Fleets
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          4 specialized AI agents — each running a different framework and open-source model via{' '}
          <span className="text-purple-400 font-medium">Featherless AI</span> — coordinate through{' '}
          <span className="text-blue-400 font-medium">Band&apos;s agentic mesh</span> to transform a
          5-15 day deployment process into a 10-minute orchestrated workflow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-blue-500/25 transition-all text-lg"
          >
            Try Live Demo
          </Link>
          <a
            href="https://github.com/hildahost3000/band-of-agents"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-xl border border-gray-700 text-gray-300 font-semibold hover:border-gray-500 hover:text-white transition-all text-lg"
          >
            View Source
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
          {STATS.map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/50">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Problem → Solution */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">The Problem</h2>
            <h3 className="text-2xl font-bold text-white mb-4">Fleet deployment is broken</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Robotics integrators deploying AMR fleets into factories face a fragmented workflow:
              site assessment, robot selection, safety review, and launch approval happen in
              silos — email chains, spreadsheets, and PDF back-and-forth.
            </p>
            <div className="space-y-3">
              {['5-15 business days of sequential handoffs', 'Context lost at every step between teams', 'Missed constraints delay go-live by weeks', '$800+/day per idle robot waiting on approvals'].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">The Solution</h2>
            <h3 className="text-2xl font-bold text-white mb-4">Multi-agent coordination on Band</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Orizon Fleet Coordinator deploys 4 AI agents into a shared Band room.
              They @mention each other, share structured JSON artifacts, enforce safety
              constraints with veto authority, and deliver an auditable deployment package.
            </p>
            <div className="space-y-3">
              {['10-minute coordinated workflow with live AI agents', 'Structured artifact handoffs with full audit trail', 'Safety veto loop — agents challenge each other', 'Human-in-the-loop final approval gate'].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Agent Showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Cross-Framework Collaboration</h2>
          <h3 className="text-3xl font-bold text-white">4 Agents, 4 Frameworks, 4 Models</h3>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
            Each agent uses a different AI framework and open-source LLM via Featherless AI — proving that
            agents from different ecosystems can coordinate seamlessly through Band.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              onClick={() => setActiveAgent(i)}
              className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
                activeAgent === i
                  ? 'bg-gray-900/80 border-gray-600 shadow-lg'
                  : 'bg-gray-900/30 border-gray-800/50 hover:border-gray-700'
              }`}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-3"
                style={{ backgroundColor: agent.color + '20', border: `1px solid ${agent.color}40` }}
              >
                <span style={{ color: agent.color }}>{agent.name.split(' ').map(w => w[0]).join('')}</span>
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">{agent.name}</h4>
              <p className="text-xs text-gray-400 mb-3">{agent.role}</p>
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400">{agent.framework}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/50 text-purple-300">{agent.model}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-3">The Workflow</h2>
          <h3 className="text-3xl font-bold text-white">From Request to Deployment in 4 Steps</h3>
          <p className="text-gray-400 mt-3">Including a safety veto → revision loop that proves real agent-to-agent collaboration</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORKFLOW_STEPS.map((step) => (
            <div key={step.step} className="relative p-6 rounded-xl bg-gray-900/50 border border-gray-800/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm mb-4">
                {step.icon}
              </div>
              <h4 className="font-semibold text-white mb-2">{step.label}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              {step.step === 3 && (
                <div className="mt-3 px-2 py-1 rounded bg-red-950/30 border border-red-800/30">
                  <p className="text-[10px] text-red-400 font-medium">VETO AUTHORITY — can block and force revision</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Fleet Ops Simulator */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <div className="rounded-2xl bg-gradient-to-r from-purple-950/30 to-blue-950/30 border border-purple-800/20 p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-3">Interactive Demo</h2>
              <h3 className="text-2xl font-bold text-white mb-4">Fleet Ops Simulator</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Control 6 AMR robots in real-time. Adjust battery levels, trigger obstacles,
                disconnect WiFi, change zones — and watch the robots coordinate their response
                autonomously in the chat room, powered by Featherless AI.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors"
              >
                Open Fleet Simulator
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['AMR-001', 'AMR-002', 'AMR-003', 'AMR-004', 'AMR-005', 'AMR-006'].map((id, i) => (
                <div key={id} className="p-3 rounded-lg bg-gray-900/60 border border-gray-800/50 text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-[10px] font-bold text-white ${i === 5 ? 'bg-yellow-600' : 'bg-green-600'}`}>
                    {id.replace('AMR-00', '')}
                  </div>
                  <p className="text-[10px] font-mono text-gray-400">{id}</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">{i === 5 ? 'Charging' : 'Active'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">Technology Stack</h2>
          <h3 className="text-3xl font-bold text-white">Built With</h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Band', desc: 'Agentic mesh for multi-agent coordination, @mention routing, veto loops, and human-in-the-loop gates', url: 'https://band.ai', color: 'blue' },
            { name: 'Featherless AI', desc: 'Serverless inference for 4 different open-source models — Qwen, Llama, DeepSeek — via OpenAI-compatible API', url: 'https://featherless.ai', color: 'purple' },
            { name: 'LangGraph', desc: 'Stateful graph framework for Site Assessor — supports revision loops without losing context', url: 'https://langchain.com', color: 'blue' },
            { name: 'CrewAI', desc: 'Task-based agent framework for Fleet Configurator with RAG tool integration', url: 'https://crewai.com', color: 'purple' },
            { name: 'PydanticAI', desc: 'Structured validation framework for Safety Reviewer — checklist items map naturally to Pydantic models', url: 'https://pydantic.dev', color: 'red' },
            { name: 'Next.js + Vercel', desc: 'Dashboard and landing page with server-side API routes, deployed on Vercel with GitHub Actions CI/CD', url: 'https://vercel.com', color: 'white' },
          ].map((tech) => (
            <a
              key={tech.name}
              href={tech.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-xl bg-gray-900/30 border border-gray-800/50 hover:border-gray-600 transition-colors group"
            >
              <h4 className="font-semibold text-white text-sm mb-2 group-hover:text-blue-400 transition-colors">{tech.name}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{tech.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Domain Authenticity */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950/20 to-blue-950/20 border border-emerald-800/20 p-8 lg:p-12 text-center">
          <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">Why This Matters</h2>
          <h3 className="text-2xl font-bold text-white mb-4">Not a Hackathon Toy — A Real Business Tool</h3>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed mb-6">
            I&apos;m building a robotics company that designs custom AMRs with FOC-controlled actuators.
            This hackathon submission is the prototype of the ops layer my company will actually use.
            Tomorrow, these same Band-connected agents will receive real telemetry from ROS2 nodes,
            trigger SLAM re-mapping, and coordinate firmware updates across live fleets.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['AMR Fleet Ops', 'ISO 3691-4 Safety', 'SLAM Navigation', 'WMS Integration', 'Real-Time Telemetry', 'FOC Motor Control'].map((tag) => (
              <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50 text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20 text-center">
        <h3 className="text-3xl font-bold text-white mb-4">See It In Action</h3>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Watch 4 AI agents coordinate a fleet deployment with safety veto loops, structured artifact handoffs, and human approval gates — all in real-time.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-blue-500/25 transition-all"
        >
          Launch Live Demo
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-8 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">Orizon Fleet Coordinator — Band of Agents Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://band.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300">Band</a>
            <a href="https://featherless.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300">Featherless AI</a>
            <a href="https://github.com/hildahost3000/band-of-agents" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300">GitHub</a>
            <span className="text-xs text-gray-600">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
