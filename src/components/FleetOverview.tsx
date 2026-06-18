'use client'

import { FLEET_STATUS_ACME } from '@/lib/fixtures'

export function FleetOverview() {
  const { fleet, stats, alerts } = FLEET_STATUS_ACME

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Fleet Telemetry (Live)
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Tasks Today" value={String(stats.tasks_completed_today)} />
        <StatCard label="Throughput" value={`${stats.throughput_tasks_per_hour}/hr`} />
        <StatCard label="Uptime" value={`${stats.fleet_uptime_pct}%`} />
        <StatCard label="Distance" value={`${stats.total_distance_km_today}km`} />
      </div>

      <div className="space-y-1">
        <p className="text-[10px] text-gray-500 font-medium">ROBOT STATUS</p>
        <div className="grid grid-cols-4 gap-1">
          {fleet.map((robot) => (
            <div
              key={robot.robot_id}
              className={`p-1.5 rounded text-center border ${
                robot.status === 'active'
                  ? 'bg-green-950/30 border-green-800/50'
                  : robot.status === 'charging' || robot.status === 'en_route_to_charger'
                    ? 'bg-yellow-950/30 border-yellow-800/50'
                    : 'bg-gray-900 border-gray-800'
              }`}
              title={`${robot.robot_id}: ${robot.status} (${robot.battery_pct}%)`}
            >
              <p className="text-[9px] font-mono text-gray-400">{robot.robot_id.replace('AMR-', '')}</p>
              <p className={`text-[10px] font-bold ${
                robot.battery_pct > 50 ? 'text-green-400' :
                robot.battery_pct > 30 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {robot.battery_pct}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 font-medium">ALERTS</p>
          {alerts.map((alert, i) => (
            <div key={i} className={`text-[10px] p-1.5 rounded ${
              alert.severity === 'warning' ? 'bg-yellow-950/30 text-yellow-300' : 'bg-fleet-veto/20 text-fleet-accent-soft'
            }`}>
              <span className="font-mono">{alert.robot_id}</span>: {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded p-2 text-center">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-200">{value}</p>
    </div>
  )
}
