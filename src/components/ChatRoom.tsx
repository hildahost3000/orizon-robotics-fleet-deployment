'use client'

import { useEffect, useRef } from 'react'
import { AgentMessage } from '@/lib/types'
import { ChatMessage } from './ChatMessage'

interface ChatRoomProps {
  messages: AgentMessage[]
  isRunning: boolean
}

export function ChatRoom({ messages, isRunning }: ChatRoomProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-fleet-border bg-fleet-panel/50">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <h2 className="text-sm font-semibold text-gray-200"># deploy-acme-motors</h2>
        <span className="text-[10px] text-gray-500 ml-auto">Band Chat Room</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {messages.length === 0 && !isRunning && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            <div className="text-center">
              <p className="text-lg mb-2">Agent Coordination Room</p>
              <p className="text-xs text-gray-600">Trigger a deployment to see agents collaborate in real-time</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isRunning && (
          <div className="flex items-center gap-2 p-3 text-gray-500 text-sm">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-fleet-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-fleet-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-fleet-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Agent processing...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
