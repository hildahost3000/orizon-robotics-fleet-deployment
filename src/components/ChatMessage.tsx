'use client'

import { AgentMessage, AGENTS } from '@/lib/types'
import { AgentAvatar } from './AgentAvatar'
import { formatTimestamp } from '@/lib/utils'

interface ChatMessageProps {
  message: AgentMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const agent = AGENTS[message.agent]

  const typeStyles = {
    message: 'border-l-fleet-border',
    event: 'border-l-fleet-accent opacity-80',
    veto: 'border-l-fleet-veto bg-red-950/20',
    approval: 'border-l-fleet-success bg-green-950/20',
    artifact: 'border-l-fleet-success bg-emerald-950/10',
  }

  return (
    <div className={`flex gap-3 p-3 border-l-2 ${typeStyles[message.type]} animate-slide-in`}>
      <AgentAvatar role={message.agent} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm" style={{ color: agent.color }}>
            {agent.name}
          </span>
          <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
            {agent.framework}
          </span>
          {message.type === 'veto' && (
            <span className="text-[10px] text-red-400 bg-red-950 px-1.5 py-0.5 rounded font-bold">
              VETO
            </span>
          )}
          {message.type === 'approval' && (
            <span className="text-[10px] text-green-400 bg-green-950 px-1.5 py-0.5 rounded font-bold">
              CLEARED
            </span>
          )}
          {message.type === 'event' && (
            <span className="text-[10px] text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded">
              event
            </span>
          )}
          <span className="text-[10px] text-gray-500 ml-auto">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
          {renderContent(message.content)}
        </div>
        {message.mentioning && message.mentioning.length > 0 && (
          <div className="flex gap-1 mt-2">
            {message.mentioning.map((m) => (
              <span key={m} className="text-[10px] text-blue-400 bg-blue-950/50 px-1.5 py-0.5 rounded">
                @{AGENTS[m].name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function renderContent(content: string): React.ReactNode {
  const parts = content.split(/(@[\w-]+)/)
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} className="text-blue-400 font-medium">
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
