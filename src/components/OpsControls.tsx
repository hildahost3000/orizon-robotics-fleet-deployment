'use client'

import { WorkflowStage } from '@/lib/types'

interface OpsControlsProps {
  stage: WorkflowStage
  approved: boolean
  onApprove: () => void
  onReject: () => void
  onViewArtifact: (type: 'site' | 'fleet' | 'safety' | 'package') => void
  onOpenCatalog: () => void
}

export function OpsControls({
  stage,
  approved,
  onApprove,
  onReject,
  onViewArtifact,
  onOpenCatalog,
}: OpsControlsProps) {
  const showApproval = stage === 'awaiting-approval' && !approved
  const workflowActive = stage !== 'idle'

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Ops Manager Controls
      </h3>

      {/* Approval section */}
      {showApproval && (
        <div className="space-y-2 p-3 rounded-lg bg-yellow-950/20 border border-yellow-800/30">
          <p className="text-[10px] text-yellow-400 font-medium uppercase">Action Required</p>
          <p className="text-[11px] text-gray-300">
            Deployment package ready. Review artifacts and approve or request changes.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              className="flex-1 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-xs font-medium transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {approved && (
        <div className="p-3 rounded-lg bg-green-950/30 border border-green-800/50">
          <p className="text-xs text-green-400 font-medium">Deployment Approved</p>
          <p className="text-[10px] text-green-600 mt-1">Infrastructure prep authorized — Day 1 begins</p>
        </div>
      )}

      {/* View artifacts */}
      {workflowActive && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-gray-500 font-medium">VIEW ARTIFACTS</p>
          <ArtifactButton
            label="Site Assessment"
            onClick={() => onViewArtifact('site')}
            enabled={stageReached(stage, 'fleet-configuration')}
          />
          <ArtifactButton
            label="Fleet Configuration"
            onClick={() => onViewArtifact('fleet')}
            enabled={stageReached(stage, 'safety-review')}
          />
          <ArtifactButton
            label="Safety Review"
            onClick={() => onViewArtifact('safety')}
            enabled={stageReached(stage, 'launch-package')}
          />
          <ArtifactButton
            label="Deployment Package"
            onClick={() => onViewArtifact('package')}
            enabled={stageReached(stage, 'awaiting-approval')}
          />
        </div>
      )}

      {/* Tools */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-gray-500 font-medium">TOOLS</p>
        <button
          onClick={onOpenCatalog}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 text-xs text-gray-300 hover:text-white transition-colors text-left"
        >
          <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Robot Catalog
        </button>
        <a
          href="https://app.band.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 text-xs text-gray-300 hover:text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Band Room
        </a>
      </div>
    </div>
  )
}

function ArtifactButton({ label, onClick, enabled }: { label: string; onClick: () => void; enabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-left text-[11px] transition-colors ${
        enabled
          ? 'text-gray-300 hover:text-white hover:bg-gray-800/50 cursor-pointer'
          : 'text-gray-600 cursor-not-allowed'
      }`}
    >
      <svg className={`w-3 h-3 ${enabled ? 'text-green-400' : 'text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {label}
    </button>
  )
}

function stageReached(current: WorkflowStage, target: WorkflowStage): boolean {
  const order: WorkflowStage[] = ['idle', 'site-assessment', 'fleet-configuration', 'safety-review', 'safety-veto', 'revision', 'safety-cleared', 'launch-package', 'awaiting-approval', 'approved']
  return order.indexOf(current) >= order.indexOf(target)
}
