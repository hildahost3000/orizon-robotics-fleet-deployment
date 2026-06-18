'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { AgentMessage, WorkflowStage, AGENTS } from '@/lib/types'
import { ACME_MOTORS_REQUEST } from '@/lib/fixtures'
import { ChatRoom } from '@/components/ChatRoom'
import { DeploymentStatus } from '@/components/DeploymentStatus'
import { AgentPanel } from '@/components/AgentPanel'
import { FleetOverview } from '@/components/FleetOverview'
import { RobotCatalog } from '@/components/RobotCatalog'
import { ArtifactViewer } from '@/components/ArtifactViewer'
import { OpsControls } from '@/components/OpsControls'
import { FleetSimulator, SimRobot } from '@/components/FleetSimulator'
import { delay } from '@/lib/utils'

type AppMode = 'deployment' | 'fleet-ops'

const ROBOT_COLORS: Record<string, string> = {
  'AMR-001': '#3b82f6',
  'AMR-002': '#8b5cf6',
  'AMR-003': '#ef4444',
  'AMR-004': '#10b981',
  'AMR-005': '#f59e0b',
  'AMR-006': '#ec4899',
}

export default function Home() {
  const [mode, setMode] = useState<AppMode>('deployment')

  // Deployment workflow state
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

  // Fleet ops state
  const [fleetMessages, setFleetMessages] = useState<AgentMessage[]>([])
  const [isFleetProcessing, setIsFleetProcessing] = useState(false)
  const eventQueueRef = useRef<Array<{ robotId: string; eventType: string; oldValue: unknown; newValue: unknown; allRobots: SimRobot[] }>>([])
  const processingRef = useRef(false)

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

  // Fleet event queue processor
  const processEventQueue = useCallback(async () => {
    if (processingRef.current) return
    processingRef.current = true
    setIsFleetProcessing(true)

    while (eventQueueRef.current.length > 0) {
      const event = eventQueueRef.current.shift()!
      try {
        const response = await fetch('/api/fleet-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        })
        const data = await response.json()

        if (data.messages && data.messages.length > 0) {
          const newMessages: AgentMessage[] = data.messages.map(
            (msg: { robot_id: string; content: string; type: string }, idx: number) => ({
              id: `fleet-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
              agent: msg.robot_id as AgentMessage['agent'],
              content: msg.content,
              timestamp: new Date().toISOString(),
              type: msg.type === 'veto' ? 'veto' : msg.type === 'event' ? 'event' : 'message',
            })
          )

          for (const msg of newMessages) {
            setFleetMessages((prev) => [...prev, msg])
            await delay(600)
          }
        }
      } catch (error) {
        console.error('Fleet event processing error:', error)
      }
    }

    processingRef.current = false
    setIsFleetProcessing(false)
  }, [])

  const handleFleetEvent = useCallback(
    (robotId: string, eventType: string, oldValue: unknown, newValue: unknown, allRobots: SimRobot[]) => {
      eventQueueRef.current.push({ robotId, eventType, oldValue, newValue, allRobots })
      processEventQueue()
    },
    [processEventQueue]
  )

  const activeMessages = mode === 'deployment' ? messages : fleetMessages
  const activeIsRunning = mode === 'deployment' ? isRunning : isFleetProcessing

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
          {/* Mode Toggle */}
          <div className="flex items-center bg-gray-800/50 border border-gray-700/50 rounded-lg p-0.5">
            <button
              onClick={() => setMode('deployment')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'deployment'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Deployment
            </button>
            <button
              onClick={() => setMode('fleet-ops')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'fleet-ops'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Fleet Ops
            </button>
          </div>

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

          {mode === 'deployment' && (
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
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-64 border-r border-fleet-border bg-fleet-panel/30 p-4 overflow-y-auto scrollbar-thin space-y-6">
          {mode === 'deployment' ? (
            <>
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
            </>
          ) : (
            <>
              <FleetSimulator
                onEvent={handleFleetEvent}
                isProcessing={isFleetProcessing}
              />
            </>
          )}
        </aside>

        {/* Center - Chat Room */}
        <main className="flex-1 flex flex-col border-r border-fleet-border">
          <FleetChatRoom
            messages={activeMessages}
            isRunning={activeIsRunning}
            mode={mode}
          />
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

function FleetChatRoom({
  messages,
  isRunning,
  mode,
}: {
  messages: AgentMessage[]
  isRunning: boolean
  mode: AppMode
}) {
  const isFleetMode = mode === 'fleet-ops'
  const channelName = isFleetMode ? '# fleet-ops-acme-motors' : '# deploy-acme-motors'
  const channelLabel = isFleetMode ? 'Robot-to-Robot Comms' : 'Band Chat Room'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-fleet-border bg-fleet-panel/50">
        <div className={`w-2 h-2 rounded-full ${isFleetMode ? 'bg-purple-500' : 'bg-green-500'} animate-pulse`} />
        <h2 className="text-sm font-semibold text-gray-200">{channelName}</h2>
        <span className="text-[10px] text-gray-500 ml-auto">{channelLabel}</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {messages.length === 0 && !isRunning && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            <div className="text-center">
              {isFleetMode ? (
                <>
                  <p className="text-lg mb-2">Fleet Operations Room</p>
                  <p className="text-xs text-gray-600">
                    Adjust robot conditions in the left panel to see them communicate in real-time
                  </p>
                  <p className="text-[10px] text-gray-700 mt-2">
                    Try: Set a robot&apos;s battery below 20%, toggle an obstacle, or change its zone
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2">Agent Coordination Room</p>
                  <p className="text-xs text-gray-600">Trigger a deployment to see agents collaborate in real-time</p>
                </>
              )}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <FleetMessage key={msg.id} message={msg} isFleetMode={isFleetMode} />
        ))}

        {isRunning && (
          <div className="flex items-center gap-2 p-3 text-gray-500 text-sm">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{isFleetMode ? 'Robots communicating...' : 'Agent processing...'}</span>
          </div>
        )}

        <AutoScroll messages={messages} />
      </div>
    </div>
  )
}

function AutoScroll({ messages }: { messages: AgentMessage[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return <div ref={ref} />
}

function FleetMessage({ message, isFleetMode }: { message: AgentMessage; isFleetMode: boolean }) {
  const isRobot = message.agent.startsWith('AMR-')
  const agentInfo = isRobot
    ? { name: message.agent, color: ROBOT_COLORS[message.agent] || '#6b7280', framework: 'HeavyLift-X200', avatar: message.agent.replace('AMR-0', '') }
    : AGENTS[message.agent]

  const typeStyles: Record<string, string> = {
    message: 'border-l-fleet-border',
    event: 'border-l-fleet-accent opacity-80',
    veto: 'border-l-fleet-veto bg-red-950/20',
    approval: 'border-l-fleet-success bg-green-950/20',
    artifact: 'border-l-fleet-success bg-emerald-950/10',
  }

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className={`flex gap-3 p-3 border-l-2 ${typeStyles[message.type]} animate-slide-in`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
        style={{ backgroundColor: isRobot ? (ROBOT_COLORS[message.agent] || '#6b7280') : (agentInfo as { color: string }).color }}
      >
        {isRobot ? message.agent.replace('AMR-00', '').replace('AMR-0', '') : (agentInfo as { avatar: string }).avatar}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm" style={{ color: isRobot ? ROBOT_COLORS[message.agent] : (agentInfo as { color: string }).color }}>
            {isRobot ? message.agent : (agentInfo as { name: string }).name}
          </span>
          <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
            {isRobot ? 'HeavyLift-X200' : (agentInfo as { framework: string }).framework}
          </span>
          {message.type === 'veto' && (
            <span className="text-[10px] text-red-400 bg-red-950 px-1.5 py-0.5 rounded font-bold">
              {isFleetMode ? 'ALERT' : 'VETO'}
            </span>
          )}
          {message.type === 'approval' && (
            <span className="text-[10px] text-green-400 bg-green-950 px-1.5 py-0.5 rounded font-bold">
              CLEARED
            </span>
          )}
          {message.type === 'event' && (
            <span className="text-[10px] text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded">
              status
            </span>
          )}
          <span className="text-[10px] text-gray-500 ml-auto">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
          {renderContent(message.content)}
        </div>
      </div>
    </div>
  )
}

function renderContent(content: string): React.ReactNode {
  const parts = content.split(/(AMR-\d{3}|@[\w-]+)/)
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} className="text-blue-400 font-medium">
          {part}
        </span>
      )
    }
    if (/^AMR-\d{3}$/.test(part)) {
      return (
        <span key={i} className="font-medium" style={{ color: ROBOT_COLORS[part] || '#9ca3af' }}>
          {part}
        </span>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="font-bold text-gray-100">
          {part.slice(2, -2)}
        </span>
      )
    }
    return part
  })
}
