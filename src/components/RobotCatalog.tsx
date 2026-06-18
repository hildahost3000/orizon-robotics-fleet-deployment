'use client'

import { useState } from 'react'
import { ROBOT_CATALOG } from '@/lib/fixtures'

interface RobotCatalogProps {
  isOpen: boolean
  onClose: () => void
}

export function RobotCatalog({ isOpen, onClose }: RobotCatalogProps) {
  const [selected, setSelected] = useState<number | null>(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-fleet-panel border border-fleet-border rounded-xl w-[900px] max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-fleet-border">
          <div>
            <h2 className="text-lg font-bold text-white">AMR Catalog</h2>
            <p className="text-xs text-gray-500">Orizon Robotics — Available Fleet Models</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          <div className="grid grid-cols-2 gap-4">
            {ROBOT_CATALOG.map((robot, idx) => (
              <div
                key={robot.model}
                onClick={() => setSelected(selected === idx ? null : idx)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selected === idx
                    ? 'border-fleet-accent bg-blue-950/20 shadow-lg shadow-blue-500/10'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{robot.model}</h3>
                    <p className="text-[10px] text-gray-500">{robot.manufacturer}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                    {robot.price_range}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <SpecBadge label="Payload" value={`${robot.payload_kg}kg`} />
                  <SpecBadge label="Speed" value={`${robot.speed_range_ms[1]}m/s`} />
                  <SpecBadge label="Ramp" value={`${robot.max_ramp_pct}%`} />
                </div>

                <p className="text-[11px] text-gray-400 mb-2">{robot.best_for}</p>

                {selected === idx && (
                  <div className="mt-3 pt-3 border-t border-gray-800 space-y-2 animate-slide-in">
                    <DetailRow label="Dimensions" value={`${robot.dimensions_mm.l}×${robot.dimensions_mm.w}×${robot.dimensions_mm.h}mm`} />
                    <DetailRow label="Battery" value={`${robot.battery.type} ${robot.battery.voltage}V/${robot.battery.capacity_ah}Ah — ${robot.battery.runtime_h}h runtime`} />
                    <DetailRow label="Charging" value={`${robot.charging.type.replace(/_/g, ' ')} — ${robot.charging.time_full_h}h full charge`} />
                    <DetailRow label="Navigation" value={robot.navigation.join(', ')} />
                    <DetailRow label="Floor types" value={robot.floor_types.join(', ')} />
                    <DetailRow label="WMS protocols" value={robot.wms_protocols.join(', ')} />
                    <DetailRow label="IP rating" value={robot.ip_rating} />
                    {'docking_precision_mm' in robot && (
                      <DetailRow label="Docking precision" value={`±${(robot as Record<string, unknown>).docking_precision_mm}mm`} />
                    )}
                    {'conveyor_interface' in robot && (
                      <DetailRow label="Conveyor" value={String((robot as Record<string, unknown>).conveyor_interface)} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-1.5 rounded-lg bg-gray-800/50">
      <p className="text-[9px] text-gray-500">{label}</p>
      <p className="text-xs font-bold text-gray-200">{value}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[10px] text-gray-500 w-24 shrink-0">{label}</span>
      <span className="text-[10px] text-gray-300">{value}</span>
    </div>
  )
}
