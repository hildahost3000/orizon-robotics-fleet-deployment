'use client'

import { useState, useCallback } from 'react'
import { AgentMessage, WorkflowStage, AGENTS } from '@/lib/types'
import { ACME_MOTORS_REQUEST } from '@/lib/fixtures'
import { ChatRoom } from '@/components/ChatRoom'
import { DeploymentStatus } from '@/components/DeploymentStatus'
import { AgentPanel } from '@/components/AgentPanel'
import { FleetOverview } from '@/components/FleetOverview'
import { RobotCatalog } from '@/components/RobotCatalog'
import { ArtifactViewer } from '@/components/ArtifactViewer'
import { OpsControls } from '@/components/OpsControls'
import { delay } from '@/lib/utils'

export default function Home() {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [stage, setStage] = useState<WorkflowStage>('idle')
  const [isRunning, setIsRunning] = useState(false)
  const [approved, setApproved] = useState(false)

  const [siteAssessment, setSiteAssessment] = useState<Record<string, unknown> | null>(null)
  const [fleetConfig, setFleetConfig] = useState<Record<string, unknown> | null>(null)
  const [safetyReview, setSafetyReview] = useState<Record<string, unknown> | null>(null)
  const [deploymentPackage, setDeploymentPackage] = useState<Record<string, unknown> | null>(null)

  const [catalogOpen, setCatalogOpen] = useState(false)
  const [artifactViewerOpen, setArtifactViewerOpen] = useState(false)
  const [artifactTitle, setArtifactTitle] = useState('')
  const [artifactData, setArtifactData] = useState<Record<string, unknown> | null>(null)

  const addMessages = useCallback((newMessages: AgentMessage[]) => {
    setMessages((prev) => [...prev, ...newMessages])
  }, [])

  const callWorkflow = async (workflowStage: string, extraData?: Record<string, unknown>) => {
    const response = await fetch('/api/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: workflowStage, ...extraData }),
    })
    return response.json()
  }

  const runFullWorkflow = useCallback(async () => {
    setIsRunning(true)
    setMessages([])
    setStage('idle')
    setApproved(false)
    setSiteAssessment(null)
    setFleetConfig(null)
    setSafetyReview(null)
    setDeploymentPackage(null)

    const triggerMsg: AgentMessage = {
      id: `msg-${Date.now()}`,
      agent: 'ops-manager',
      content: `@site-assessor New deployment request: **Acme Motors** automotive assembly plant.\n\n- Location: ${ACME_MOTORS_REQUEST.location}\n- AMRs needed: ${ACME_MOTORS_REQUEST.amr_count}\n- Payload: ${ACME_MOTORS_REQUEST.payload_range_kg[0]}-${ACME_MOTORS_REQUEST.payload_range_kg[1]}kg\n- Task: ${ACME_MOTORS_REQUEST.primary_task}\n- Special requirements: ${ACME_MOTORS_REQUEST.special_requirements.join(', ')}\n\nFactory specification attached. Begin site assessment.`,
      timestamp: new Date().toISOString(),
      type: 'message',
      mentioning: ['site-assessor'],
    }
    addMessages([triggerMsg])
    await delay(1500)

    setStage('site-assessment')
    const sa = await callWorkflow('site-assessment')
    setSiteAssessment(sa.artifact)
    addMessages(sa.messages)
    await delay(2000)

    setStage('fleet-configuration')
    const fc = await callWorkflow('fleet-configuration', { siteAssessment: sa.artifact })
    setFleetConfig(fc.artifact)
    addMessages(fc.messages)
    await delay(2000)

    setStage('safety-review')
    const sr = await callWorkflow('safety-review', {
      siteAssessment: sa.artifact,
      fleetConfig: fc.artifact,
    })
    addMessages(sr.messages)
    await delay(2500)

    setStage('safety-veto')
    await delay(1500)
    setStage('revision')
    const rev = await callWorkflow('revision')
    addMessages(rev.messages)
    await delay(2000)

    setStage('safety-review')
    const sr2 = await callWorkflow('safety-review-revision', {
      siteAssessment: sa.artifact,
      fleetConfig: fc.artifact,
    })
    setSafetyReview(sr2.artifact)
    addMessages(sr2.messages)
    await delay(2000)

    setStage('safety-cleared')
    await delay(500)
    setStage('launch-package')
    const lp = await callWorkflow('launch-package', {
      siteAssessment: sa.artifact,
      fleetConfig: fc.artifact,
      safetyReview: sr2.artifact,
    })
    setDeploymentPackage(lp.artifact)
    addMessages(lp.messages)
    await delay(1000)

    setStage('awaiting-approval')
    setIsRunning(false)
  }, [addMessages])

  const handleApprove = () => {
    const approvalMsg: AgentMessage = {
      id: `msg-${Date.now()}`,
      agent: 'ops-manager',
      content: `**Deployment APPROVED** for Acme Motors Plant 4.\n\nAll configurations reviewed. Infrastructure prep authorized to begin Day 1.\n\nApproved by: Ops Manager\nTimestamp: ${new Date().toISOString()}\nAudit reference: DEPLOY-ACME-2026-0618`,
      timestamp: new Date().toISOString(),
      type: 'approval',
    }
    addMessages([approvalMsg])
    setStage('approved')
    setApproved(true)
  }

  const handleReject = () => {
    const rejectMsg: AgentMessage = {
      id: `msg-${Date.now()}`,
      agent: 'ops-manager',
      content: `**Deployment REJECTED** — requesting additional changes.\n\n@launch-coordinator Please add contingency plan for charger dock failure scenario. What happens if CD-1 goes offline during peak shift?\n\nAlso need clarification on ramp R1 monitoring protocol for loaded transits.`,
      timestamp: new Date().toISOString(),
      type: 'message',
      mentioning: ['launch-coordinator'],
    }
    addMessages([rejectMsg])
  }

  const handleViewArtifact = (type: 'site' | 'fleet' | 'safety' | 'package') => {
    const map = {
      site: { title: 'Site Assessment — Acme Motors Plant 4', data: siteAssessment },
      fleet: { title: 'Fleet Configuration — 8x HeavyLift-X200', data: fleetConfig },
      safety: { title: 'Safety Review — Final Pass', data: safetyReview },
      package: { title: 'Deployment Package — Ready for Approval', data: deploymentPackage },
    }
    const item = map[type]
    if (item.data) {
      setArtifactTitle(item.title)
      setArtifactData(item.data)
      setArtifactViewerOpen(true)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-fleet-border bg-fleet-panel/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Orizon Fleet Coordinator</h1>
            <p className="text-[10px] text-gray-500">Multi-Agent AMR Deployment Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <a
              href="https://band.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-800/50 border border-gray-700/50 hover:border-gray-500 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-gray-400">Band</span>
            </a>
            <a
              href="https://featherless.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-800/50 border border-gray-700/50 hover:border-gray-500 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-[10px] text-gray-400">Featherless</span>
            </a>
          </div>
          <button
            onClick={runFullWorkflow}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isRunning
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20'
            }`}
          >
            {isRunning ? 'Workflow Running...' : stage === 'idle' ? 'Deploy Fleet' : 'Restart Workflow'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-64 border-r border-fleet-border bg-fleet-panel/30 p-4 overflow-y-auto scrollbar-thin space-y-6">
          <DeploymentStatus stage={stage} />
          <OpsControls
            stage={stage}
            approved={approved}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewArtifact={handleViewArtifact}
            onOpenCatalog={() => setCatalogOpen(true)}
          />
          <AgentPanel />
        </aside>

        {/* Center - Chat Room */}
        <main className="flex-1 flex flex-col border-r border-fleet-border">
          <ChatRoom messages={messages} isRunning={isRunning} />
        </main>

        {/* Right sidebar */}
        <aside className="w-72 bg-fleet-panel/30 p-4 overflow-y-auto scrollbar-thin">
          <FleetOverview />
        </aside>
      </div>

      {/* Modals */}
      <RobotCatalog isOpen={catalogOpen} onClose={() => setCatalogOpen(false)} />
      <ArtifactViewer
        isOpen={artifactViewerOpen}
        onClose={() => setArtifactViewerOpen(false)}
        title={artifactTitle}
        data={artifactData}
      />
    </div>
  )
}
