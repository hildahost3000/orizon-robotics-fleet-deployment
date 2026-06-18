import { NextRequest, NextResponse } from 'next/server'
import { callFeatherlessModel } from '@/lib/featherless'

export const maxDuration = 60

const FLEET_COORDINATOR_PROMPT = `You are simulating a fleet of 6 AMR (Autonomous Mobile Robot) units communicating in a Band chat room. Each robot has a distinct personality reflected in its communication style, but all are professional and concise.

Robot personalities:
- AMR-001: Senior unit, calm and authoritative. Zone A-B shuttle lead.
- AMR-002: Efficient and data-driven. Zone B-C shuttle. Reports precise metrics.
- AMR-003: Cautious and thorough. Zone C-D shuttle. Always considers safety first.
- AMR-004: Adaptable flex unit. Cheerful, always ready to help cover for others.
- AMR-005: Steady and reliable. Zone A-B support. Methodical communicator.
- AMR-006: Quiet but precise. Mainly in charging rotation. Focuses on energy management.

When a condition changes for a robot, generate realistic robot-to-robot chat messages. Include:
1. The affected robot reporting its condition change
2. 1-2 other robots responding with operational adjustments
3. Any coordination needed (route changes, coverage, safety alerts)

Keep messages short and operational (1-3 sentences each). Use technical AMR vocabulary (waypoints, SLAM, WMS, payload, dock, geofence, etc).

Respond ONLY with a JSON array of message objects. Each message has:
- "robot_id": the robot speaking (e.g. "AMR-001")
- "content": the message text
- "type": one of "message", "event", "veto" (for safety critical)

Example output format:
[
  {"robot_id": "AMR-003", "content": "Battery at 18%. Initiating return-to-dock sequence via waypoint CW-3.", "type": "event"},
  {"robot_id": "AMR-004", "content": "Copy AMR-003. I'll cover Zone C-D shuttle until you're back at ≥50%. Adjusting route planner.", "type": "message"},
  {"robot_id": "AMR-001", "content": "Fleet coordination: AMR-004 reassigned to C-D coverage. AMR-003 ETA to dock CD-1: ~3min.", "type": "message"}
]`

export async function POST(request: NextRequest) {
  try {
    const { robotId, eventType, oldValue, newValue, allRobots } = await request.json()
    const useLive = !!process.env.FEATHERLESS_API_KEY

    const eventDescription = buildEventDescription(robotId, eventType, oldValue, newValue)
    const fleetContext = buildFleetContext(allRobots)

    if (useLive) {
      try {
        const response = await callFeatherlessModel(
          'Qwen/Qwen2.5-32B-Instruct',
          FLEET_COORDINATOR_PROMPT,
          `Current fleet status:\n${fleetContext}\n\nEVENT: ${eventDescription}\n\nGenerate robot-to-robot chat messages responding to this event. Return ONLY a JSON array.`,
          0.7
        )

        const jsonMatch = response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const messages = JSON.parse(jsonMatch[0])
          return NextResponse.json({ messages, live: true })
        }
        return NextResponse.json({ messages: generateFallbackMessages(robotId, eventType, oldValue, newValue), live: false })
      } catch {
        return NextResponse.json({ messages: generateFallbackMessages(robotId, eventType, oldValue, newValue), live: false })
      }
    }

    return NextResponse.json({ messages: generateFallbackMessages(robotId, eventType, oldValue, newValue), live: false })
  } catch (error) {
    console.error('Fleet event error:', error)
    return NextResponse.json({ error: 'Failed to process fleet event' }, { status: 500 })
  }
}

function buildEventDescription(robotId: string, eventType: string, oldValue: unknown, newValue: unknown): string {
  const descriptions: Record<string, string> = {
    battery: `${robotId} battery changed from ${oldValue}% to ${newValue}%`,
    status: `${robotId} status changed from "${oldValue}" to "${newValue}"`,
    obstacle: `${robotId} obstacle detection: ${newValue ? 'OBSTACLE DETECTED' : 'obstacle cleared'}`,
    wifi: `${robotId} WiFi signal: ${newValue ? 'CONNECTION RESTORED' : 'CONNECTION LOST'}`,
    payload: `${robotId} payload changed from ${oldValue}kg to ${newValue}kg`,
    zone: `${robotId} zone assignment changed from Zone ${oldValue} to Zone ${newValue}`,
    speed: `${robotId} speed changed from ${oldValue} m/s to ${newValue} m/s`,
  }
  return descriptions[eventType] || `${robotId}: ${eventType} changed to ${newValue}`
}

function buildFleetContext(robots: Array<Record<string, unknown>>): string {
  return robots.map((r) =>
    `${r.robot_id}: status=${r.status}, battery=${r.battery_pct}%, zone=${r.zone}, speed=${r.speed_ms}m/s, payload=${r.payload_kg}kg, wifi=${r.wifi_connected ? 'ok' : 'LOST'}, obstacle=${r.obstacle ? 'YES' : 'no'}`
  ).join('\n')
}

function generateFallbackMessages(
  robotId: string,
  eventType: string,
  oldValue: unknown,
  newValue: unknown
): Array<{ robot_id: string; content: string; type: string }> {
  const otherRobots = ['AMR-001', 'AMR-002', 'AMR-003', 'AMR-004', 'AMR-005', 'AMR-006'].filter((r) => r !== robotId)
  const responder = otherRobots[Math.floor(Math.random() * otherRobots.length)]
  const coordinator = otherRobots.find((r) => r !== responder) || 'AMR-001'

  switch (eventType) {
    case 'battery': {
      const val = Number(newValue)
      if (val < 20) {
        return [
          { robot_id: robotId, content: `Battery critical at ${val}%. Initiating emergency return-to-dock via nearest charging station. Current tasks being suspended.`, type: 'event' },
          { robot_id: responder, content: `Copy ${robotId}. I'll absorb your remaining task queue. Adjusting my route planner to cover your zone.`, type: 'message' },
          { robot_id: coordinator, content: `Fleet alert: ${robotId} entering emergency charge. ${responder} covering. Estimated return to service: ~25min at current charge rate.`, type: 'message' },
        ]
      } else if (val < 40) {
        return [
          { robot_id: robotId, content: `Battery at ${val}%. Scheduling dock rotation after current task completes. ETA to charger: ~5min.`, type: 'event' },
          { robot_id: responder, content: `Acknowledged ${robotId}. I'm at ${60 + Math.floor(Math.random() * 30)}% — can extend my shift if needed.`, type: 'message' },
        ]
      }
      return [
        { robot_id: robotId, content: `Battery status update: ${val}%. Operating normally within parameters.`, type: 'event' },
      ]
    }

    case 'status': {
      if (newValue === 'error') {
        return [
          { robot_id: robotId, content: `FAULT DETECTED. Entering safe-stop mode. Activating warning beacons. Requesting diagnostic review.`, type: 'veto' },
          { robot_id: coordinator, content: `Fleet alert: ${robotId} in fault state. ${responder}, can you cover? Dispatching maintenance request to ops dashboard.`, type: 'message' },
          { robot_id: responder, content: `Confirmed. Rerouting to cover ${robotId}'s zone. Adjusting my waypoint sequence.`, type: 'message' },
        ]
      } else if (newValue === 'charging') {
        return [
          { robot_id: robotId, content: `Docking at charging station. Estimated full charge time: ~90min. Current battery will be reported every 10min.`, type: 'event' },
          { robot_id: coordinator, content: `${robotId} entering charge cycle. Fleet capacity temporarily at ${5}/6 active units.`, type: 'message' },
        ]
      } else if (newValue === 'maintenance') {
        return [
          { robot_id: robotId, content: `Entering maintenance mode. LiDAR calibration and wheel inspection scheduled. Taking myself offline.`, type: 'event' },
          { robot_id: responder, content: `Copy. Redistributing ${robotId}'s task queue across available units. Priority tasks will be handled first.`, type: 'message' },
        ]
      }
      return [
        { robot_id: robotId, content: `Status updated to: ${newValue}. Resuming normal operations.`, type: 'event' },
        { robot_id: coordinator, content: `Fleet log: ${robotId} back to ${newValue}. Restoring standard task assignments.`, type: 'message' },
      ]
    }

    case 'obstacle': {
      if (newValue) {
        return [
          { robot_id: robotId, content: `OBSTACLE DETECTED on current path! LiDAR scan confirms blockage at waypoint. Executing safe-stop. Requesting fleet reroute advisory.`, type: 'veto' },
          { robot_id: responder, content: `Received ${robotId}'s obstacle alert. Updating my navigation mesh — marking that corridor as temporarily blocked. Using alternate route via Aisle A3.`, type: 'message' },
          { robot_id: coordinator, content: `All units: obstacle reported by ${robotId}. Avoid that path segment until cleared. Updating fleet route planner.`, type: 'message' },
        ]
      }
      return [
        { robot_id: robotId, content: `Obstacle cleared on my path. Resuming navigation. SLAM map updated with clear corridor status.`, type: 'event' },
        { robot_id: coordinator, content: `Route cleared by ${robotId}. All units can resume standard pathways. Navigation mesh updated.`, type: 'message' },
      ]
    }

    case 'wifi': {
      if (!newValue) {
        return [
          { robot_id: coordinator, content: `WARNING: Lost telemetry from ${robotId}. WiFi connectivity disrupted. Initiating safe-stop fallback protocol for that unit.`, type: 'veto' },
          { robot_id: responder, content: `Confirmed ${robotId} offline on mesh. Last known position logged. I'll avoid routing near their last-known zone to prevent congestion.`, type: 'message' },
        ]
      }
      return [
        { robot_id: robotId, content: `WiFi connectivity restored. Signal strength: -58dBm. Re-syncing WMS task queue and position broadcast.`, type: 'event' },
        { robot_id: coordinator, content: `${robotId} back on mesh. Telemetry nominal. Reintegrating into fleet task scheduler.`, type: 'message' },
      ]
    }

    case 'payload': {
      const val = Number(newValue)
      if (val > 100) {
        return [
          { robot_id: robotId, content: `Payload at ${val}kg — approaching rated capacity (120kg). Reducing speed to 0.8 m/s for stability. Extra caution on ramp R1.`, type: 'event' },
          { robot_id: coordinator, content: `Noted. ${robotId} heavy-loaded at ${val}kg. All units maintain extra clearance distance. Ramp R1 speed limit enforced.`, type: 'message' },
        ]
      }
      return [
        { robot_id: robotId, content: `Payload updated: ${val}kg. Within nominal operating range. Speed and route unchanged.`, type: 'event' },
      ]
    }

    case 'zone': {
      return [
        { robot_id: robotId, content: `Zone reassignment: moving to Zone ${newValue}. Recalculating waypoints and updating WMS zone subscription.`, type: 'event' },
        { robot_id: responder, content: `Acknowledged ${robotId} zone change. Adjusting my coverage to account for the gap in Zone ${oldValue}.`, type: 'message' },
        { robot_id: coordinator, content: `Fleet rebalance: ${robotId} → Zone ${newValue}. ${responder} expanding coverage of Zone ${oldValue}. Task distribution updated.`, type: 'message' },
      ]
    }

    case 'speed': {
      return [
        { robot_id: robotId, content: `Speed adjusted to ${newValue} m/s. ${Number(newValue) < 0.5 ? 'Entering precision mode for docking operations.' : 'Operating at standard transit speed.'}`, type: 'event' },
      ]
    }

    default:
      return [
        { robot_id: robotId, content: `Parameter updated: ${eventType} = ${newValue}`, type: 'event' },
      ]
  }
}
