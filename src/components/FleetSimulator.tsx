'use client'

import { useState, useCallback, useRef } from 'react'

export interface SimRobot {
  robot_id: string
  model: string
  status: 'active' | 'charging' | 'error' | 'maintenance' | 'idle'
  battery_pct: number
  zone: string
  speed_ms: number
  payload_kg: number
  wifi_connected: boolean
  obstacle: boolean
}

const INITIAL_ROBOTS: SimRobot[] = [
  { robot_id: 'AMR-001', model: 'HeavyLift-X200', status: 'active', battery_pct: 72, zone: 'A', speed_ms: 1.1, payload_kg: 80, wifi_connected: true, obstacle: false },
  { robot_id: 'AMR-002', model: 'HeavyLift-X200', status: 'active', battery_pct: 58, zone: 'B', speed_ms: 0.9, payload_kg: 65, wifi_connected: true, obstacle: false },
  { robot_id: 'AMR-003', model: 'HeavyLift-X200', status: 'active', battery_pct: 85, zone: 'C', speed_ms: 1.2, payload_kg: 90, wifi_connected: true, obstacle: false },
  { robot_id: 'AMR-004', model: 'HeavyLift-X200', status: 'active', battery_pct: 64, zone: 'D', speed_ms: 1.0, payload_kg: 45, wifi_connected: true, obstacle: false },
  { robot_id: 'AMR-005', model: 'HeavyLift-X200', status: 'active', battery_pct: 91, zone: 'A', speed_ms: 1.3, payload_kg: 70, wifi_connected: true, obstacle: false },
  { robot_id: 'AMR-006', model: 'HeavyLift-X200', status: 'charging', battery_pct: 45, zone: 'C', speed_ms: 0, payload_kg: 0, wifi_connected: true, obstacle: false },
]

interface FleetSimulatorProps {
  onEvent: (robotId: string, eventType: string, oldValue: unknown, newValue: unknown, allRobots: SimRobot[]) => void
  isProcessing: boolean
}

export function FleetSimulator({ onEvent, isProcessing }: FleetSimulatorProps) {
  const [robots, setRobots] = useState<SimRobot[]>(INITIAL_ROBOTS)
  const [expandedRobot, setExpandedRobot] = useState<string | null>(null)

  const commitChange = useCallback((robotId: string, field: keyof SimRobot, value: unknown) => {
    setRobots((prev) => {
      const robot = prev.find((r) => r.robot_id === robotId)
      if (!robot) return prev
      const oldValue = robot[field]
      if (oldValue === value) return prev

      const updated = prev.map((r) => r.robot_id === robotId ? { ...r, [field]: value } : r)
      setTimeout(() => onEvent(robotId, field, oldValue, value, updated), 0)
      return updated
    })
  }, [onEvent])

  const updateLocal = useCallback((robotId: string, field: keyof SimRobot, value: unknown) => {
    setRobots((prev) => prev.map((r) => r.robot_id === robotId ? { ...r, [field]: value } : r))
  }, [])

  const activeCount = robots.filter((r) => r.status === 'active').length
  const avgBattery = Math.round(robots.reduce((sum, r) => sum + r.battery_pct, 0) / robots.length)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Fleet Simulator
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-950/50 text-green-400 border border-green-800/30">
            {activeCount}/6 active
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-fleet-veto/30 text-fleet-accent-soft border border-fleet-border">
            avg {avgBattery}%
          </span>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 leading-relaxed">
        Adjust robot conditions below. Changes trigger real-time agent conversations powered by Featherless AI.
      </p>

      {isProcessing && (
        <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-fleet-veto/20 border border-fleet-border">
          <div className="flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-fleet-accent-soft animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 rounded-full bg-fleet-accent-soft animate-bounce" style={{ animationDelay: '100ms' }} />
            <div className="w-1 h-1 rounded-full bg-fleet-accent-soft animate-bounce" style={{ animationDelay: '200ms' }} />
          </div>
          <span className="text-[10px] text-fleet-accent-soft">Robots communicating...</span>
        </div>
      )}

      <div className="space-y-1">
        {robots.map((robot) => (
          <RobotCard
            key={robot.robot_id}
            robot={robot}
            expanded={expandedRobot === robot.robot_id}
            onToggle={() => setExpandedRobot(expandedRobot === robot.robot_id ? null : robot.robot_id)}
            onCommit={commitChange}
            onLocalUpdate={updateLocal}
            disabled={isProcessing}
          />
        ))}
      </div>
    </div>
  )
}

interface RobotCardProps {
  robot: SimRobot
  expanded: boolean
  onToggle: () => void
  onCommit: (robotId: string, field: keyof SimRobot, value: unknown) => void
  onLocalUpdate: (robotId: string, field: keyof SimRobot, value: unknown) => void
  disabled: boolean
}

function RobotCard({ robot, expanded, onToggle, onCommit, onLocalUpdate, disabled }: RobotCardProps) {
  const batteryRef = useRef(robot.battery_pct)
  const speedRef = useRef(robot.speed_ms)
  const payloadRef = useRef(robot.payload_kg)

  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    charging: 'bg-yellow-500',
    error: 'bg-red-500',
    maintenance: 'bg-orange-500',
    idle: 'bg-gray-500',
  }

  const borderColors: Record<string, string> = {
    active: 'border-green-800/50',
    charging: 'border-yellow-800/50',
    error: 'border-red-800/50',
    maintenance: 'border-orange-800/50',
    idle: 'border-gray-700/50',
  }

  return (
    <div className={`rounded-lg border ${borderColors[robot.status]} bg-gray-900/50 transition-all`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-800/30 rounded-lg transition-colors"
      >
        <div className={`w-2 h-2 rounded-full ${statusColors[robot.status]} ${robot.status === 'active' ? 'animate-pulse' : ''}`} />
        <span className="text-xs font-mono text-gray-300 font-medium">{robot.robot_id}</span>
        <span className="text-[9px] text-gray-500">Zone {robot.zone}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {robot.obstacle && (
            <span className="text-[8px] px-1 py-0.5 rounded bg-red-950 text-red-400 font-bold">OBS</span>
          )}
          {!robot.wifi_connected && (
            <span className="text-[8px] px-1 py-0.5 rounded bg-orange-950 text-orange-400 font-bold">NO WiFi</span>
          )}
          <span className={`text-[10px] font-bold ${
            robot.battery_pct > 50 ? 'text-green-400' : robot.battery_pct > 20 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {robot.battery_pct}%
          </span>
          <svg className={`w-3 h-3 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-800/50 pt-2">
          {/* Battery */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] text-gray-400">Battery</label>
              <span className="text-[10px] text-gray-300 font-mono">{robot.battery_pct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={robot.battery_pct}
              onChange={(e) => {
                batteryRef.current = Number(e.target.value)
                onLocalUpdate(robot.robot_id, 'battery_pct', batteryRef.current)
              }}
              onMouseUp={() => onCommit(robot.robot_id, 'battery_pct', batteryRef.current)}
              onTouchEnd={() => onCommit(robot.robot_id, 'battery_pct', batteryRef.current)}
              disabled={disabled}
              className="w-full h-1.5 rounded-full appearance-none bg-gray-700 accent-fleet-accent cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Speed */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] text-gray-400">Speed</label>
              <span className="text-[10px] text-gray-300 font-mono">{robot.speed_ms.toFixed(1)} m/s</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={robot.speed_ms * 10}
              onChange={(e) => {
                speedRef.current = Number(e.target.value) / 10
                onLocalUpdate(robot.robot_id, 'speed_ms', speedRef.current)
              }}
              onMouseUp={() => onCommit(robot.robot_id, 'speed_ms', speedRef.current)}
              onTouchEnd={() => onCommit(robot.robot_id, 'speed_ms', speedRef.current)}
              disabled={disabled}
              className="w-full h-1.5 rounded-full appearance-none bg-gray-700 accent-fleet-accent cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Payload */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] text-gray-400">Payload</label>
              <span className="text-[10px] text-gray-300 font-mono">{robot.payload_kg}kg</span>
            </div>
            <input
              type="range"
              min={0}
              max={120}
              step={5}
              value={robot.payload_kg}
              onChange={(e) => {
                payloadRef.current = Number(e.target.value)
                onLocalUpdate(robot.robot_id, 'payload_kg', payloadRef.current)
              }}
              onMouseUp={() => onCommit(robot.robot_id, 'payload_kg', payloadRef.current)}
              onTouchEnd={() => onCommit(robot.robot_id, 'payload_kg', payloadRef.current)}
              disabled={disabled}
              className="w-full h-1.5 rounded-full appearance-none bg-gray-700 accent-fleet-accent cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Status</label>
            <select
              value={robot.status}
              onChange={(e) => onCommit(robot.robot_id, 'status', e.target.value)}
              disabled={disabled}
              className="w-full text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gray-300 focus:border-fleet-accent focus:outline-none disabled:opacity-50"
            >
              <option value="active">Active</option>
              <option value="charging">Charging</option>
              <option value="error">Error / Fault</option>
              <option value="maintenance">Maintenance</option>
              <option value="idle">Idle</option>
            </select>
          </div>

          {/* Zone */}
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Zone</label>
            <div className="grid grid-cols-4 gap-1">
              {['A', 'B', 'C', 'D'].map((z) => (
                <button
                  key={z}
                  onClick={() => onCommit(robot.robot_id, 'zone', z)}
                  disabled={disabled}
                  className={`py-1 rounded text-[10px] font-medium transition-colors disabled:opacity-50 ${
                    robot.zone === z
                      ? 'bg-fleet-accent text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-2">
            <ToggleButton
              label="Obstacle"
              active={robot.obstacle}
              activeColor="bg-red-600"
              onClick={() => onCommit(robot.robot_id, 'obstacle', !robot.obstacle)}
              disabled={disabled}
            />
            <ToggleButton
              label={robot.wifi_connected ? 'WiFi OK' : 'WiFi OFF'}
              active={!robot.wifi_connected}
              activeColor="bg-orange-600"
              onClick={() => onCommit(robot.robot_id, 'wifi_connected', !robot.wifi_connected)}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ToggleButton({
  label,
  active,
  activeColor,
  onClick,
  disabled,
}: {
  label: string
  active: boolean
  activeColor: string
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors disabled:opacity-50 ${
        active
          ? `${activeColor} text-white`
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  )
}
