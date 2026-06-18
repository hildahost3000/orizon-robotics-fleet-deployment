'use client'

import { AGENTS, AgentRole } from '@/lib/types'

interface AgentAvatarProps {
  role: AgentRole
  size?: 'sm' | 'md' | 'lg'
}

export function AgentAvatar({ role, size = 'md' }: AgentAvatarProps) {
  const agent = AGENTS[role]
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ backgroundColor: agent.color + '20', color: agent.color, border: `2px solid ${agent.color}` }}
      title={`${agent.name} (${agent.framework})`}
    >
      {agent.avatar}
    </div>
  )
}
