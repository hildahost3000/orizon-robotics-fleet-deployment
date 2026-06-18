'use client'

import { AGENTS, AgentRole } from '@/lib/types'
import { AgentAvatar } from './AgentAvatar'

const AGENT_ROLES: AgentRole[] = ['site-assessor', 'fleet-configurator', 'safety-reviewer', 'launch-coordinator']

export function AgentPanel() {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Agent Fleet
      </h3>
      {AGENT_ROLES.map((role) => {
        const agent = AGENTS[role]
        return (
          <div key={role} className="flex items-start gap-2 p-2 rounded-lg bg-gray-900/50 border border-gray-800/50">
            <AgentAvatar role={role} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">{agent.name}</p>
              <div className="flex gap-1 mt-0.5">
                <span className="text-[9px] text-gray-500 bg-gray-800 px-1 rounded">{agent.framework}</span>
                <span className="text-[9px] text-gray-500 bg-gray-800 px-1 rounded truncate max-w-[120px]">
                  {agent.model.split('/').pop()}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
