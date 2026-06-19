'use client'

import Link from 'next/link'

const AGENTS = [
  {
    name: 'Site Assessor',
    framework: 'LangGraph',
    model: 'Qwen2.5-32B',
    role: 'Parses factory specs, flags Wi-Fi dead zones and ramp margins',
  },
  {
    name: 'Fleet Configurator',
    framework: 'CrewAI + RAG',
    model: 'Llama-3.1-70B',
    role: 'Robot selection, zone assignment, charging rotation',
  },
  {
    name: 'Safety Reviewer',
    framework: 'PydanticAI',
    model: 'DeepSeek-R1',
    role: 'ISO 3691-4 checklist — holds veto authority',
  },
  {
    name: 'Launch Coordinator',
    framework: 'AnthropicAdapter',
    model: 'Qwen2.5-72B',
    role: 'Packages the deployment timeline and audit hash',
  },
]

const WORKFLOW = [
  { step: '01', label: 'Assess', detail: 'Site Assessor reads the factory spec and produces structured infrastructure flags.' },
  { step: '02', label: 'Configure', detail: 'Fleet Configurator picks robots from catalog, assigns zones and waypoints.' },
  { step: '03', label: 'Review', detail: 'Safety Reviewer runs ISO checks. Can veto and send the thread back.' },
  { step: '04', label: 'Launch', detail: 'Launch Coordinator ships the package. Ops Manager approves go-live.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-fleet-cream text-fleet-ink">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-16 py-5 border-b border-fleet-ink/10">
        <span className="font-display text-xl tracking-wide text-fleet-accent">orizon</span>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/hildahost3000/orizon-robotics-fleet-deployment"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-fleet-muted hover:text-fleet-ink transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://docs.band.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-fleet-muted hover:text-fleet-ink transition-colors"
          >
            Band docs
          </a>
          <Link
            href="/dashboard"
            className="text-sm font-medium px-5 py-2 bg-fleet-accent text-white hover:bg-fleet-veto transition-colors"
          >
            Open demo
          </Link>
        </div>
      </nav>

      {/* Hero — mapo-style stacked headline */}
      <section className="px-6 lg:px-16 pt-20 pb-24 lg:pt-28 lg:pb-32 border-b border-fleet-ink/10">
        <p className="text-xs font-medium tracking-[0.18em] uppercase text-fleet-accent mb-8">
          Band of Agents Hackathon · Track 1
        </p>
        <h1 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] tracking-tight font-medium max-w-4xl">
          Deploy robots
          <br />
          without losing
          <br />
          the thread.
        </h1>
        <p className="mt-10 text-lg text-fleet-muted max-w-xl leading-relaxed">
          Orizon Fleet Coordinator is a deployment desk for AMR integrators. Four agents — each a
          different framework, each a different open-source model on Featherless — coordinate in
          Band until the fleet config is safe enough to launch.
        </p>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-fleet-accent text-white font-medium hover:bg-fleet-veto transition-colors"
          >
            Try the live demo
          </Link>
          <a
            href="https://github.com/hildahost3000/orizon-robotics-fleet-deployment"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 border border-fleet-ink/20 text-fleet-ink font-medium hover:border-fleet-ink/40 transition-colors"
          >
            View source
          </a>
        </div>
      </section>

      {/* Problem / solution */}
      <section className="px-6 lg:px-16 py-24 lg:py-32 grid lg:grid-cols-2 gap-16 lg:gap-24 border-b border-fleet-ink/10">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-fleet-accent mb-4">
            The problem
          </p>
          <h2 className="font-display text-3xl lg:text-4xl leading-tight font-medium mb-6">
            Every deployment stalls in email.
          </h2>
          <p className="text-fleet-muted leading-relaxed mb-8">
            Site assessment, robot selection, safety review, client sign-off — each step lives in a
            different inbox. Context gets lost. One missed Wi-Fi dead zone or ramp gradient can
            delay go-live by weeks.
          </p>
          <ul className="space-y-3 text-sm text-fleet-muted">
            <li className="flex gap-3">
              <span className="text-fleet-accent mt-1">—</span>
              5–15 business days of sequential handoffs
            </li>
            <li className="flex gap-3">
              <span className="text-fleet-accent mt-1">—</span>
              $800+/day per idle robot when launch slips
            </li>
            <li className="flex gap-3">
              <span className="text-fleet-accent mt-1">—</span>
              No independent safety auditor in the loop
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-fleet-accent mb-4">
            What we built
          </p>
          <h2 className="font-display text-3xl lg:text-4xl leading-tight font-medium mb-6">
            A coordination room, not another dashboard.
          </h2>
          <p className="text-fleet-muted leading-relaxed mb-8">
            You trigger a deployment. Four agents join a Band room, share structured JSON
            artifacts, and run a safety veto loop until ISO 3691-4 checks pass. Ops Manager
            approves the final package before Day 1.
          </p>
          <p className="font-display text-xl italic text-fleet-ink/80 border-l-2 border-fleet-accent pl-5">
            Sales closes the deal. Then deployment lead gets a PDF, three spreadsheets, and a
            prayer. We fixed that.
          </p>
        </div>
      </section>

      {/* Agents */}
      <section className="px-6 lg:px-16 py-24 lg:py-32 border-b border-fleet-ink/10">
        <p className="text-xs font-medium tracking-[0.18em] uppercase text-fleet-accent mb-4">
          Four agents
        </p>
        <h2 className="font-display text-3xl lg:text-4xl leading-tight font-medium mb-4 max-w-lg">
          Each owns one job. Each runs a different stack.
        </h2>
        <p className="text-fleet-muted max-w-xl mb-14">
          Cross-framework collaboration through Band — LangGraph, CrewAI, PydanticAI, and
          AnthropicAdapter on Featherless open-source models.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-fleet-ink/10">
          {AGENTS.map((agent) => (
            <div key={agent.name} className="bg-fleet-cream p-6 lg:p-8">
              <h3 className="font-medium text-fleet-ink mb-2">{agent.name}</h3>
              <p className="text-sm text-fleet-muted mb-4 leading-relaxed">{agent.role}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] tracking-wide uppercase px-2 py-1 border border-fleet-ink/15 text-fleet-muted">
                  {agent.framework}
                </span>
                <span className="text-[10px] tracking-wide uppercase px-2 py-1 border border-fleet-accent/30 text-fleet-accent">
                  {agent.model}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="px-6 lg:px-16 py-24 lg:py-32 border-b border-fleet-ink/10">
        <p className="text-xs font-medium tracking-[0.18em] uppercase text-fleet-accent mb-4">
          The workflow
        </p>
        <h2 className="font-display text-3xl lg:text-4xl leading-tight font-medium mb-14 max-w-lg">
          Assess. Configure. Veto. Launch.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {WORKFLOW.map((item) => (
            <div key={item.step}>
              <span className="font-display text-4xl text-fleet-accent/40">{item.step}</span>
              <h3 className="font-medium text-lg mt-3 mb-2">{item.label}</h3>
              <p className="text-sm text-fleet-muted leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo scenario */}
      <section className="px-6 lg:px-16 py-24 lg:py-32 bg-fleet-dark text-fleet-cream">
        <p className="text-xs font-medium tracking-[0.18em] uppercase text-fleet-accent-soft mb-4">
          Demo scenario
        </p>
        <h2 className="font-display text-3xl lg:text-4xl leading-tight font-medium mb-12 max-w-2xl">
          Acme Motors Plant 4 — 8 AMRs, automotive assembly.
        </h2>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="border border-fleet-accent-soft/25 p-6 lg:p-8">
            <p className="text-xs tracking-wide uppercase text-fleet-accent-soft mb-3">First pass — veto</p>
            <p className="text-fleet-cream/70 text-sm leading-relaxed">
              Site Assessor flags a Wi-Fi dead zone in Zone C. Fleet Configurator assigns 8×
              HeavyLift-X200. Safety Reviewer <strong className="text-fleet-cream">vetoes</strong>:
              robots in Zone C lose WMS connectivity — collision risk, no e-stop in the dead zone.
            </p>
          </div>
          <div className="border border-fleet-accent-soft/40 bg-fleet-accent/10 p-6 lg:p-8">
            <p className="text-xs tracking-wide uppercase text-fleet-accent-soft mb-3">After revision — pass</p>
            <p className="text-fleet-cream/70 text-sm leading-relaxed">
              Site Assessor adds a Wi-Fi 6 AP on column C-NE-7. Coverage goes from 95% to 99.2%.
              Safety Reviewer passes all ISO checks. Launch Coordinator packages a 3-day deployment
              timeline.
            </p>
          </div>
        </div>
        <p className="mt-10 font-display text-xl italic text-fleet-cream/80 max-w-lg">
          5–15 day manual process → ~10 minute coordinated agent session. The veto loop is the demo.
        </p>
      </section>

      {/* Fleet ops + context */}
      <section className="px-6 lg:px-16 py-24 lg:py-32 border-b border-fleet-ink/10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-fleet-accent mb-4">
              Fleet ops mode
            </p>
            <h2 className="font-display text-3xl lg:text-4xl leading-tight font-medium mb-6">
              Six robots. Real-time comms.
            </h2>
            <p className="text-fleet-muted leading-relaxed mb-8">
              Switch to Fleet Ops in the dashboard. Drop a robot&apos;s battery below 20%, toggle an
              obstacle, change its zone — and watch the fleet coordinate in the chat room, powered
              by Featherless inference.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-fleet-accent hover:text-fleet-veto transition-colors"
            >
              Open fleet simulator
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-fleet-accent mb-4">
              Why this exists
            </p>
            <h2 className="font-display text-3xl lg:text-4xl leading-tight font-medium mb-6">
              A working idea I&apos;m building toward.
            </h2>
            <p className="text-fleet-muted leading-relaxed">
              I&apos;m working toward Orizon Robotics — custom AMRs with FOC-controlled actuators.
              This project is a working prototype: a training exercise and mental model for how I
              want client deployments to flow — assess, configure, veto, launch — before the
              hardware is ready. I&apos;m building the muscle memory now so the real ops layer is
              smoother later.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-16 py-24 lg:py-32 text-center">
        <h2 className="font-display text-4xl lg:text-5xl leading-tight font-medium mb-6">
          See the veto loop live.
        </h2>
        <p className="text-fleet-muted max-w-md mx-auto mb-10">
          Full 8-step workflow: assess → configure → veto → revise → pass → package → approve.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-10 py-4 bg-fleet-accent text-white font-medium hover:bg-fleet-veto transition-colors"
        >
          Launch demo
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-16 py-8 border-t border-fleet-ink/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-fleet-muted">
        <span className="font-display tracking-wide text-fleet-accent">orizon</span>
        <div className="flex items-center gap-6">
          <a href="https://band.ai" target="_blank" rel="noopener noreferrer" className="hover:text-fleet-ink transition-colors">
            Band
          </a>
          <a href="https://featherless.ai" target="_blank" rel="noopener noreferrer" className="hover:text-fleet-ink transition-colors">
            Featherless
          </a>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
