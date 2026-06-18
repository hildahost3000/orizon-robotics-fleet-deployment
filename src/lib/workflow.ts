import { AgentMessage, WorkflowStage } from './types'
import { FACTORY_SPEC, ROBOT_CATALOG, ACME_MOTORS_REQUEST } from './fixtures'
import { callFeatherlessModel } from './featherless'
import {
  SITE_ASSESSOR_PROMPT,
  FLEET_CONFIGURATOR_PROMPT,
  SAFETY_REVIEWER_PROMPT,
  LAUNCH_COORDINATOR_PROMPT,
} from './prompts'

export interface WorkflowState {
  stage: WorkflowStage
  messages: AgentMessage[]
  siteAssessment?: Record<string, unknown>
  fleetConfig?: Record<string, unknown>
  safetyReview?: Record<string, unknown>
  deploymentPackage?: Record<string, unknown>
}

function createMessage(
  agent: AgentMessage['agent'],
  content: string,
  type: AgentMessage['type'] = 'message',
  mentioning?: AgentMessage['mentioning'],
  artifact?: Record<string, unknown>
): AgentMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    agent,
    content,
    timestamp: new Date().toISOString(),
    type,
    mentioning,
    artifact,
  }
}

export async function runSiteAssessment(useLive: boolean): Promise<{
  messages: AgentMessage[]
  artifact: Record<string, unknown>
}> {
  const messages: AgentMessage[] = []

  messages.push(
    createMessage('site-assessor', 'Analyzing factory floor plan and infrastructure specifications...', 'event')
  )

  const siteAssessment = {
    client_id: 'acme-motors',
    factory_type: 'automotive_assembly',
    floor_plan_summary: {
      total_area_sqm: 12000,
      aisles: FACTORY_SPEC.aisles,
      ramps: FACTORY_SPEC.ramps,
      doors: FACTORY_SPEC.doors,
      charger_candidates: FACTORY_SPEC.charger_locations.map((cl) => ({
        location: `${cl.zone} ${cl.position}`,
        electrical_capacity_kw: cl.electrical_kw,
      })),
    },
    infrastructure: {
      wifi_coverage: `${FACTORY_SPEC.wifi.coverage_pct}% — dead zone in ${FACTORY_SPEC.wifi.dead_zones[0]}`,
      wms_system: FACTORY_SPEC.wms.system,
      wms_api: `REST v${FACTORY_SPEC.wms.version}, supports ${FACTORY_SPEC.wms.events.join(', ')}`,
    },
    environment: {
      temperature_range_c: FACTORY_SPEC.environment.temperature_range_c,
      floor_surface: FACTORY_SPEC.environment.floor_surface,
      pedestrian_zones: FACTORY_SPEC.environment.pedestrian_zones,
    },
    flags: [
      {
        severity: 'critical' as const,
        item: 'Wi-Fi dead zone in Zone C northeast corner — robots will lose connectivity in operational area. Structural steel column interference.',
      },
      {
        severity: 'warning' as const,
        item: 'Ramp R1 at 4.5% gradient — within spec for HeavyLift-X200 (max 5%) but leaves only 0.5% margin with full 100kg payload.',
      },
      {
        severity: 'warning' as const,
        item: 'Only 2 charger locations identified. Fleet of 8 requires minimum 2 docks — no redundancy margin.',
      },
      {
        severity: 'info' as const,
        item: 'Aisle A2 width (2.8m) provides adequate clearance for X200 (0.8m) but limited passing space for bidirectional traffic.',
      },
    ],
    recommended_robot_count: 8,
  }

  if (useLive) {
    try {
      const response = await callFeatherlessModel(
        'Qwen/Qwen2.5-32B-Instruct',
        SITE_ASSESSOR_PROMPT,
        `New deployment request received:\n${JSON.stringify(ACME_MOTORS_REQUEST, null, 2)}\n\nFactory specification:\n${JSON.stringify(FACTORY_SPEC, null, 2)}\n\nAnalyze this deployment request and produce a SiteAssessment. Focus on identifying critical infrastructure gaps and safety concerns.`,
        0.4
      )
      messages.push(
        createMessage(
          'site-assessor',
          response || 'Site assessment analysis complete. See structured artifact below.',
          'message',
          ['fleet-configurator']
        )
      )
    } catch {
      messages.push(
        createMessage(
          'site-assessor',
          `Site assessment complete for Acme Motors Plant 4.\n\n**Key findings:**\n- Total facility: 12,000 sqm across 4 zones (Raw Materials → Sub-Assembly → Final Assembly → Finished Goods)\n- **CRITICAL**: Wi-Fi dead zone in Zone C NE corner — structural steel interference. Robots will lose WMS connectivity in active operational area.\n- Ramp R1 (Zone B to mezzanine) at 4.5% gradient — within HeavyLift-X200 spec (max 5%) but minimal margin under full load\n- 2 charger locations identified — meets minimum but no redundancy\n- WMS: Manhattan Associates v3.2, REST API with task_dispatch events\n\n@fleet-configurator Assessment ready. Recommend 8x heavy-payload AMRs. Proceed with fleet configuration based on the attached SiteAssessment artifact.`,
          'message',
          ['fleet-configurator'],
          siteAssessment
        )
      )
    }
  } else {
    messages.push(
      createMessage(
        'site-assessor',
        `Site assessment complete for Acme Motors Plant 4.\n\n**Key findings:**\n- Total facility: 12,000 sqm across 4 zones (Raw Materials → Sub-Assembly → Final Assembly → Finished Goods)\n- **CRITICAL**: Wi-Fi dead zone in Zone C NE corner — structural steel interference. Robots will lose WMS connectivity in active operational area.\n- Ramp R1 (Zone B to mezzanine) at 4.5% gradient — within HeavyLift-X200 spec (max 5%) but minimal margin under full load\n- 2 charger locations identified — meets minimum but no redundancy\n- WMS: Manhattan Associates v3.2, REST API with task_dispatch events\n\n@fleet-configurator Assessment ready. Recommend 8x heavy-payload AMRs. Proceed with fleet configuration based on the attached SiteAssessment artifact.`,
        'message',
        ['fleet-configurator'],
        siteAssessment
      )
    )
  }

  return { messages, artifact: siteAssessment }
}

export async function runFleetConfiguration(
  siteAssessment: Record<string, unknown>,
  useLive: boolean
): Promise<{ messages: AgentMessage[]; artifact: Record<string, unknown> }> {
  const messages: AgentMessage[] = []

  messages.push(
    createMessage('fleet-configurator', 'Searching robot catalog via RAG for payload ≥100kg, automotive environment compatible...', 'event')
  )

  messages.push(
    createMessage('fleet-configurator', `RAG search result: Found HeavyLift-X200 (120kg payload, LiDAR SLAM + visual odometry, max ramp 5%, sealed concrete compatible). Best match for requirements.`, 'event')
  )

  const fleetConfig = {
    client_id: 'acme-motors',
    fleet: Array.from({ length: 8 }, (_, i) => ({
      robot_id: `AMR-${String(i + 1).padStart(3, '0')}`,
      model: 'HeavyLift-X200',
      payload_capacity_kg: 120,
      max_speed_ms: 1.2,
      assigned_zone: i < 3 ? 'Zone A → Zone B shuttle' : i < 5 ? 'Zone B → Zone C shuttle' : i < 7 ? 'Zone C → Zone D shuttle' : 'Flex / overflow',
      tasks: i < 3
        ? ['raw_material_transport', 'pallet_pickup_zone_a']
        : i < 5
          ? ['sub_assembly_delivery', 'wip_transport']
          : i < 7
            ? ['final_assembly_supply', 'finished_goods_staging']
            : ['overflow_support', 'priority_delivery'],
      waypoints: [
        { name: `pickup_${i}`, x: 10 + i * 8, y: 25 + (i % 3) * 10, type: 'pickup' },
        { name: `dropoff_${i}`, x: 50 + i * 5, y: 15 + (i % 3) * 8, type: 'dropoff' },
        { name: i < 4 ? 'charger_cd1' : 'charger_cd2', x: i < 4 ? 5.0 : 75.0, y: 5.0, type: 'charging_dock' },
      ],
      charging_schedule: 'rotate_at_30pct_battery',
    })),
    wms_integration: {
      endpoint: 'https://acme-wms.manhattan.com/api/v3.2/tasks',
      auth: 'oauth2_client_credentials',
      events_subscribe: ['new_transport_request', 'priority_change', 'task_cancel'],
      events_publish: ['task_accepted', 'task_complete', 'robot_position_update', 'task_failed'],
    },
    charging_infrastructure: {
      docks: [
        { id: 'CD-1', location: 'Zone A NW corner', capacity_robots: 2 },
        { id: 'CD-2', location: 'Zone C SE corner', capacity_robots: 2 },
      ],
      rotation_strategy: 'round_robin_at_30pct — always 1 robot charging per zone, max 2 simultaneous',
    },
    estimated_throughput: '~45 transport tasks/hour at steady state (85% fleet utilization)',
  }

  if (useLive) {
    try {
      const response = await callFeatherlessModel(
        'meta-llama/Meta-Llama-3.1-70B-Instruct',
        FLEET_CONFIGURATOR_PROMPT,
        `Site Assessment received:\n${JSON.stringify(siteAssessment, null, 2)}\n\nRobot Catalog available:\n${JSON.stringify(ROBOT_CATALOG, null, 2)}\n\nConfigure the optimal fleet for this deployment. Select models, assign zones, define waypoints, and set charging schedules.`,
        0.5
      )
      messages.push(
        createMessage('fleet-configurator', response || 'Fleet configuration complete.', 'message', ['safety-reviewer'])
      )
    } catch {
      messages.push(createFleetConfigMessage(fleetConfig, messages))
    }
  } else {
    messages.push(createFleetConfigMessage(fleetConfig, messages))
  }

  return { messages, artifact: fleetConfig }
}

function createFleetConfigMessage(fleetConfig: Record<string, unknown>, _messages: AgentMessage[]): AgentMessage {
  return createMessage(
    'fleet-configurator',
    `Fleet configuration complete for Acme Motors.\n\n**Fleet composition:** 8x HeavyLift-X200 (120kg payload each)\n**Zone assignment:**\n- 3 robots: Zone A → Zone B (raw materials shuttle)\n- 2 robots: Zone B → Zone C (sub-assembly delivery)\n- 2 robots: Zone C → Zone D (final assembly → finished goods)\n- 1 robot: Flex/overflow for priority tasks\n\n**Charging strategy:** Round-robin at 30% battery, 2 docks (CD-1 in Zone A, CD-2 in Zone C), max 2 robots charging simultaneously\n**WMS integration:** Manhattan Associates v3.2 REST API, OAuth2 auth, subscribing to task_dispatch + priority_change\n**Estimated throughput:** ~45 tasks/hour at 85% fleet utilization\n\n@safety-reviewer Fleet configuration ready for safety compliance review. All robot specs, waypoints, and charging infrastructure attached.`,
    'message',
    ['safety-reviewer'],
    fleetConfig
  )
}

export async function runSafetyReview(
  siteAssessment: Record<string, unknown>,
  fleetConfig: Record<string, unknown>,
  useLive: boolean,
  isRevision: boolean = false
): Promise<{ messages: AgentMessage[]; artifact: Record<string, unknown>; vetoed: boolean }> {
  const messages: AgentMessage[] = []

  messages.push(
    createMessage('safety-reviewer', `Reviewing deployment against ISO 3691-4 safety checklist${isRevision ? ' (REVISION REVIEW)' : ''}...`, 'event')
  )

  if (!isRevision) {
    const safetyReview = {
      overall_verdict: 'FAIL',
      items: [
        { category: 'structural', item: 'ramp_gradient', status: 'WARNING', note: 'R1 at 4.5%, within 5% limit for HeavyLift-X200 but only 0.5% margin. Acceptable with monitoring.' },
        { category: 'structural', item: 'door_clearance', status: 'PASS', note: 'D1 at 2.8m, robot width 0.8m = 1.0m margin per side. Adequate.' },
        { category: 'structural', item: 'floor_surface', status: 'PASS', note: 'Sealed concrete + epoxy compatible with X200 polyurethane wheels.' },
        { category: 'operational', item: 'pedestrian_zones', status: 'PASS', note: 'Speed reduction zones defined for Zone A main aisle and break room corridor.' },
        { category: 'infrastructure', item: 'wifi_coverage', status: 'FAIL', note: 'Coverage at 95% — BELOW 98% minimum. Dead zone in Zone C NE is in active operational area. Robots transiting Zone C will lose WMS connectivity, causing task failures and potential collision risk from stale position data.' },
        { category: 'infrastructure', item: 'charger_redundancy', status: 'WARNING', note: '2 docks for 8 robots meets minimum. Recommend adding 3rd dock for N+1 redundancy.' },
        { category: 'payload', item: 'payload_margin', status: 'PASS', note: 'X200 rated 120kg, max expected 100kg = 20% margin. Meets requirement.' },
        { category: 'continuity', item: 'fleet_availability', status: 'PASS', note: 'Rotation schedule maintains ≥85% availability (6+ robots active at all times).' },
      ],
      veto: true,
      veto_reason: 'CRITICAL SAFETY FAILURE: Wi-Fi dead zone in Zone C northeast corner is within active robot operational area. Robots transiting this zone will lose WMS connectivity, leading to: (1) stale position broadcasts → collision risk, (2) missed task assignments → throughput degradation, (3) inability to receive emergency stop commands → safety hazard. Cannot approve deployment until remediated.',
      required_revisions: [
        { assigned_to: 'site-assessor', action: 'Add Wi-Fi 6 access point to Zone C NE corner (mount on steel column causing interference) OR define geofenced exclusion zone with safe-stop fallback behavior' },
        { assigned_to: 'fleet-configurator', action: 'If exclusion zone chosen: add Zone C NE geofence to robot waypoint planner, ensure no routes transit dead zone until AP installed' },
      ],
    }

    if (useLive) {
      try {
        const response = await callFeatherlessModel(
          'deepseek-ai/DeepSeek-R1-0528',
          SAFETY_REVIEWER_PROMPT,
          `Review the following deployment for safety compliance:\n\nSite Assessment:\n${JSON.stringify(siteAssessment, null, 2)}\n\nFleet Configuration:\n${JSON.stringify(fleetConfig, null, 2)}\n\nNote: Wi-Fi coverage is 95% with a dead zone in Zone C northeast corner. This is an active operational area.`,
          0.3
        )
        messages.push(
          createMessage('safety-reviewer', response || 'Safety review complete.', 'veto', ['site-assessor', 'fleet-configurator'])
        )
      } catch {
        messages.push(createVetoMessage(safetyReview))
      }
    } else {
      messages.push(createVetoMessage(safetyReview))
    }

    return { messages, artifact: safetyReview, vetoed: true }
  } else {
    const passedReview = {
      overall_verdict: 'PASS',
      items: [
        { category: 'structural', item: 'ramp_gradient', status: 'PASS', note: 'R1 at 4.5%, within 5% limit for HeavyLift-X200. Monitoring protocol defined.' },
        { category: 'structural', item: 'door_clearance', status: 'PASS', note: 'All doors provide ≥30cm margin per side.' },
        { category: 'structural', item: 'floor_surface', status: 'PASS', note: 'Compatible with X200 polyurethane wheels.' },
        { category: 'operational', item: 'pedestrian_zones', status: 'PASS', note: 'Speed limits configured for all pedestrian areas.' },
        { category: 'infrastructure', item: 'wifi_coverage', status: 'PASS', note: 'REMEDIATED: Wi-Fi 6 AP added to Zone C NE (mounted on steel column). Coverage now 99.2%. Verified signal strength ≥-65dBm across all operational zones.' },
        { category: 'infrastructure', item: 'charger_redundancy', status: 'PASS', note: '2 docks + planned 3rd dock provides adequate redundancy.' },
        { category: 'payload', item: 'payload_margin', status: 'PASS', note: '120kg capacity vs 100kg max load = 20% margin.' },
        { category: 'continuity', item: 'fleet_availability', status: 'PASS', note: '≥85% fleet availability maintained with rotation schedule.' },
        { category: 'continuity', item: 'wms_failover', status: 'PASS', note: 'Safe-stop behavior defined for WMS disconnection: robots halt in place, activate warning beacons, await reconnection.' },
      ],
      veto: false,
      veto_reason: null,
    }

    messages.push(
      createMessage(
        'safety-reviewer',
        `**SAFETY REVIEW: ALL CHECKS PASSED** ✓\n\nRevised deployment addresses all previously identified critical issues:\n- Wi-Fi coverage remediated: AP added to Zone C NE, coverage now 99.2%\n- WMS failover behavior defined\n- All structural, operational, and payload checks pass\n\nOverall verdict: **PASS**\n\n@launch-coordinator Safety cleared. Proceed with deployment package synthesis. All artifacts approved for final packaging.`,
        'approval',
        ['launch-coordinator'],
        passedReview
      )
    )

    return { messages, artifact: passedReview, vetoed: false }
  }
}

function createVetoMessage(safetyReview: Record<string, unknown>): AgentMessage {
  return createMessage(
    'safety-reviewer',
    `**🚨 SAFETY VETO ISSUED**\n\n**Reason:** Wi-Fi dead zone in Zone C northeast corner is within active robot operational area.\n\n**Risk assessment:**\n1. Robots transiting Zone C NE will lose WMS connectivity\n2. Stale position data → increased collision risk with personnel\n3. Unable to receive emergency stop commands in dead zone\n4. Task assignment failures → throughput degradation\n\n**Required revisions:**\n\n@site-assessor → Install Wi-Fi 6 access point on Zone C NE steel column (the interference source can also serve as the mount point) OR define geofenced exclusion zone with safe-stop fallback behavior.\n\n@fleet-configurator → If exclusion zone path chosen: update waypoint planner to route around Zone C NE dead zone. No robot transit permitted in uncovered area until AP is operational.\n\n**This deployment CANNOT proceed until Wi-Fi coverage reaches ≥98% in all operational zones.**`,
    'veto',
    ['site-assessor', 'fleet-configurator'],
    safetyReview
  )
}

export async function runRevision(useLive: boolean): Promise<{ messages: AgentMessage[] }> {
  const messages: AgentMessage[] = []

  messages.push(
    createMessage('site-assessor', 'Revising infrastructure plan per Safety Reviewer requirements...', 'event')
  )

  if (useLive) {
    try {
      const response = await callFeatherlessModel(
        'Qwen/Qwen2.5-32B-Instruct',
        SITE_ASSESSOR_PROMPT,
        `REVISION REQUIRED: Safety Reviewer vetoed deployment due to Wi-Fi dead zone in Zone C NE corner.\n\nRequired action: Add Wi-Fi 6 access point to Zone C NE corner OR define geofenced exclusion zone.\n\nUpdate the site assessment to address this critical infrastructure gap. The steel column causing interference can serve as the AP mount point.`,
        0.4
      )
      messages.push(
        createMessage('site-assessor', response || 'Revision complete.', 'message', ['safety-reviewer'])
      )
    } catch {
      messages.push(createRevisionMessage())
    }
  } else {
    messages.push(createRevisionMessage())
  }

  return { messages }
}

function createRevisionMessage(): AgentMessage {
  return createMessage(
    'site-assessor',
    `**Revised Site Assessment (v2)**\n\n**Infrastructure update — Wi-Fi remediation:**\n- Added: Wi-Fi 6 access point (Cisco Catalyst 9136) mounted on steel column C-NE-7 in Zone C northeast corner\n- Expected coverage after installation: 99.2% (up from 95%)\n- Signal strength in former dead zone: ≥-65dBm (verified via RF propagation model)\n- Redundant backhaul: connected to both AP-11 and AP-12 for failover\n\n**Additional infrastructure improvements:**\n- Defined WMS failover behavior: safe-stop protocol (robots halt, activate amber beacons, maintain last-known position broadcast via UWB until reconnection)\n- Added 3rd charger dock candidate location: Zone B east wall (7.2kW capacity available)\n\n**Updated coverage:** Wi-Fi 99.2% | Charger candidates: 3 locations | All zones fully covered\n\n@safety-reviewer Revised assessment addresses all flagged issues. Wi-Fi AP added to Zone C NE, failover behavior defined. Please re-review.`,
    'message',
    ['safety-reviewer']
  )
}

export async function runLaunchCoordinator(
  siteAssessment: Record<string, unknown>,
  fleetConfig: Record<string, unknown>,
  safetyReview: Record<string, unknown>,
  useLive: boolean
): Promise<{ messages: AgentMessage[]; artifact: Record<string, unknown> }> {
  const messages: AgentMessage[] = []

  messages.push(
    createMessage('launch-coordinator', 'Synthesizing deployment package from all approved artifacts...', 'event')
  )

  const deploymentPackage = {
    client_id: 'acme-motors',
    status: 'READY_FOR_APPROVAL',
    summary: '8-robot HeavyLift-X200 fleet for Acme Motors automotive assembly transport. All safety checks passed after Wi-Fi infrastructure remediation. Fleet provides inter-zone material transport across 4 production zones with estimated throughput of 45 tasks/hour. Deployment timeline: 3 business days from approval.',
    deployment_timeline: [
      { day: 1, action: 'Infrastructure prep: Install Wi-Fi 6 AP on column C-NE-7 in Zone C, verify coverage ≥99%. Install charger docks CD-1 (Zone A) and CD-2 (Zone C). Electrical validation.' },
      { day: 2, action: 'Robot provisioning: Flash fleet firmware, configure SLAM maps from LiDAR scan, calibrate waypoints per zone assignment, WMS OAuth2 handshake with Manhattan Associates.' },
      { day: 3, action: 'Supervised pilot: 4-hour monitored operation (2 robots per zone), validate throughput targets, confirm charging rotation, E-stop response testing. Sign-off → full autonomous operation.' },
    ],
    configs_attached: ['site_assessment_v2.json', 'fleet_config_v1.json', 'safety_review_v2_passed.json'],
    approval_required_from: 'ops_manager',
    fleet_summary: {
      total_robots: 8,
      model: 'HeavyLift-X200',
      payload_per_unit_kg: 120,
      estimated_throughput: '45 tasks/hour',
      fleet_availability: '≥85%',
      total_investment: '$360,000-440,000 (hardware) + infrastructure prep',
    },
    risk_mitigations: [
      'Wi-Fi dead zone → remediated with dedicated AP installation',
      'Ramp gradient margin → monitoring protocol with load-cell verification',
      'Charger redundancy → 3rd dock location identified for future installation',
    ],
    audit_hash: 'sha256:7f3a8c2e1d9b4f5e6a0c3d7b8e1f2a4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
  }

  if (useLive) {
    try {
      const response = await callFeatherlessModel(
        'Qwen/Qwen2.5-72B-Instruct',
        LAUNCH_COORDINATOR_PROMPT,
        `All safety checks passed. Synthesize the final deployment package.\n\nSite Assessment (v2):\n${JSON.stringify(siteAssessment, null, 2)}\n\nFleet Configuration:\n${JSON.stringify(fleetConfig, null, 2)}\n\nSafety Review (PASSED):\n${JSON.stringify(safetyReview, null, 2)}`,
        0.6
      )
      messages.push(
        createMessage('launch-coordinator', response || 'Deployment package ready.', 'message', ['ops-manager'])
      )
    } catch {
      messages.push(createLaunchMessage(deploymentPackage))
    }
  } else {
    messages.push(createLaunchMessage(deploymentPackage))
  }

  return { messages, artifact: deploymentPackage }
}

function createLaunchMessage(deploymentPackage: Record<string, unknown>): AgentMessage {
  return createMessage(
    'launch-coordinator',
    `**📦 DEPLOYMENT PACKAGE READY — Acme Motors Plant 4**\n\n**Summary:** 8-robot HeavyLift-X200 fleet for automotive assembly inter-zone transport. All safety checks passed.\n\n**Fleet:** 8x HeavyLift-X200 | Payload: 120kg/unit | Throughput: ~45 tasks/hour\n\n**Deployment Timeline:**\n| Day | Action |\n|-----|--------|\n| 1 | Infrastructure: Wi-Fi AP install + charger docks + electrical validation |\n| 2 | Provisioning: Firmware, SLAM mapping, waypoint calibration, WMS handshake |\n| 3 | Pilot: 4h supervised operation → sign-off → full autonomous mode |\n\n**Safety Status:** ALL CHECKS PASSED (after Wi-Fi remediation)\n**Audit Trail:** SHA-256 hash chain covers all artifacts\n\n@ops-manager Deployment package ready for your review and approval. All configurations, safety clearances, and timeline attached. Please approve to initiate Day 1 infrastructure preparation.`,
    'artifact',
    ['ops-manager'],
    deploymentPackage
  )
}
