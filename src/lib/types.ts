export interface AgentMessage {
  id: string
  agent: AgentRole
  content: string
  timestamp: string
  type: 'message' | 'event' | 'veto' | 'approval' | 'artifact'
  mentioning?: AgentRole[]
  artifact?: Record<string, unknown>
}

export type AgentRole =
  | 'site-assessor'
  | 'fleet-configurator'
  | 'safety-reviewer'
  | 'launch-coordinator'
  | 'ops-manager'

export type WorkflowStage =
  | 'idle'
  | 'site-assessment'
  | 'fleet-configuration'
  | 'safety-review'
  | 'safety-veto'
  | 'revision'
  | 'safety-cleared'
  | 'launch-package'
  | 'awaiting-approval'
  | 'approved'

export interface AgentConfig {
  role: AgentRole
  name: string
  framework: string
  model: string
  description: string
  avatar: string
  color: string
}

export interface DeploymentRequest {
  client: string
  factory_type: string
  location: string
  amr_count: number
  payload_range_kg: [number, number]
  primary_task: string
  special_requirements: string[]
}

export interface SiteAssessment {
  client_id: string
  factory_type: string
  floor_plan_summary: {
    total_area_sqm: number
    aisles: Array<{ id: string; width_m: number; length_m: number; surface: string }>
    ramps: Array<{ id: string; gradient_pct: number; location: string }>
    doors: Array<{ id: string; width_m: number; type: string }>
    charger_candidates: Array<{ location: string; electrical_capacity_kw: number }>
  }
  infrastructure: {
    wifi_coverage: string
    wms_system: string
    wms_api: string
  }
  environment: {
    temperature_range_c: [number, number]
    floor_surface: string
    pedestrian_zones: string[]
  }
  flags: Array<{ severity: 'critical' | 'warning' | 'info'; item: string }>
  recommended_robot_count: number
}

export interface FleetConfig {
  client_id: string
  fleet: Array<{
    robot_id: string
    model: string
    payload_capacity_kg: number
    max_speed_ms: number
    assigned_zone: string
    tasks: string[]
    waypoints: Array<{ name: string; x: number; y: number; type: string }>
    charging_schedule: string
  }>
  wms_integration: {
    endpoint: string
    auth: string
    events_subscribe: string[]
    events_publish: string[]
  }
  charging_infrastructure: {
    docks: Array<{ id: string; location: string; capacity_robots: number }>
    rotation_strategy: string
  }
  estimated_throughput: string
}

export interface SafetyReview {
  overall_verdict: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL'
  items: Array<{
    category: string
    item: string
    status: 'PASS' | 'FAIL' | 'WARNING'
    note: string
    required_action?: string
  }>
  veto: boolean
  veto_reason?: string
  required_revisions?: Array<{ assigned_to: string; action: string }>
}

export interface DeploymentPackage {
  client_id: string
  status: 'READY_FOR_APPROVAL'
  summary: string
  deployment_timeline: Array<{ day: number; action: string }>
  configs_attached: string[]
  approval_required_from: string
  audit_hash: string
}

export const AGENTS: Record<AgentRole, AgentConfig> = {
  'site-assessor': {
    role: 'site-assessor',
    name: 'Site Assessor',
    framework: 'LangGraph',
    model: 'Qwen/Qwen2.5-32B-Instruct',
    description: 'Parses deployment requests and produces structured site assessments with infrastructure flags',
    avatar: 'SA',
    color: '#0d9488',
  },
  'fleet-configurator': {
    role: 'fleet-configurator',
    name: 'Fleet Configurator',
    framework: 'CrewAI',
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    description: 'Selects robot models from catalog via RAG, generates fleet deployment configuration',
    avatar: 'FC',
    color: '#b45309',
  },
  'safety-reviewer': {
    role: 'safety-reviewer',
    name: 'Safety Reviewer',
    framework: 'PydanticAI',
    model: 'deepseek-ai/DeepSeek-R1-0528',
    description: 'Reviews configurations against ISO 3691-4 safety standards. Holds VETO authority.',
    avatar: 'SR',
    color: '#9b1b30',
  },
  'launch-coordinator': {
    role: 'launch-coordinator',
    name: 'Launch Coordinator',
    framework: 'AnthropicAdapter',
    model: 'Qwen/Qwen2.5-72B-Instruct',
    description: 'Synthesizes all artifacts into deployment-ready package for human approval',
    avatar: 'LC',
    color: '#2d6a4f',
  },
  'ops-manager': {
    role: 'ops-manager',
    name: 'Ops Manager',
    framework: 'Human',
    model: 'N/A',
    description: 'Human operator who triggers deployments and approves final packages',
    avatar: 'OM',
    color: '#f59e0b',
  },
}
