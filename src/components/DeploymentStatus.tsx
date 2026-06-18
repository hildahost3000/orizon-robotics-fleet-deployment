'use client'

import { WorkflowStage } from '@/lib/types'

interface DeploymentStatusProps {
  stage: WorkflowStage
}

const STAGES = [
  { key: 'site-assessment', label: 'Site Assessment', agent: 'Site Assessor' },
  { key: 'fleet-configuration', label: 'Fleet Configuration', agent: 'Fleet Configurator' },
  { key: 'safety-review', label: 'Safety Review', agent: 'Safety Reviewer' },
  { key: 'launch-package', label: 'Launch Package', agent: 'Launch Coordinator' },
  { key: 'awaiting-approval', label: 'Human Approval', agent: 'Ops Manager' },
] as const

function getStageStatus(stageKey: string, currentStage: WorkflowStage) {
  const order = ['idle', 'site-assessment', 'fleet-configuration', 'safety-review', 'safety-veto', 'revision', 'safety-cleared', 'launch-package', 'awaiting-approval', 'approved']
  const currentIdx = order.indexOf(currentStage)

  const stageMap: Record<string, number> = {
    'site-assessment': 1,
    'fleet-configuration': 2,
    'safety-review': 3,
    'launch-package': 7,
    'awaiting-approval': 8,
  }

  const stageIdx = stageMap[stageKey] ?? 0

  if (currentStage === 'approved' && stageKey === 'awaiting-approval') return 'complete'
  if (currentStage === 'safety-veto' && stageKey === 'safety-review') return 'vetoed'
  if (currentStage === 'revision' && stageKey === 'safety-review') return 'revising'
  if (currentIdx > stageIdx) return 'complete'
  if (currentIdx === stageIdx) return 'active'
  return 'pending'
}

export function DeploymentStatus({ stage }: DeploymentStatusProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Deployment Pipeline
      </h3>
      {STAGES.map((s) => {
        const status = getStageStatus(s.key, stage)
        return (
          <div key={s.key} className="flex items-center gap-3">
            <StatusIcon status={status} />
            <div className="flex-1">
              <p className={`text-sm ${status === 'active' ? 'text-white font-medium' : 'text-gray-400'}`}>
                {s.label}
              </p>
              <p className="text-[10px] text-gray-600">{s.agent}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'complete':
      return (
        <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    case 'active':
      return (
        <div className="w-5 h-5 rounded-full bg-fleet-accent/20 border border-fleet-accent flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-fleet-accent-soft animate-pulse" />
        </div>
      )
    case 'vetoed':
      return (
        <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
    case 'revising':
      return (
        <div className="w-5 h-5 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      )
    default:
      return (
        <div className="w-5 h-5 rounded-full bg-gray-800 border border-gray-700" />
      )
  }
}
