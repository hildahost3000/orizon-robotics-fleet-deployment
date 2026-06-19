# Orizon Fleet Coordinator

**Multi-Agent AMR Fleet Deployment & Operations Platform**

> 4 AI agents coordinate through Band to transform a deployment request into a safety-cleared, deployment-ready configuration package — compressing a 5-15 day manual workflow into a single 10-minute coordinated session.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hildahost3000/orizon-robotics-fleet-deployment)

---

## The Problem

**Robotics companies selling AMR fleets B2B** — each client deployment is different: floor layout, facility size, robot series, safety constraints. Today that handover still runs manually:

```
Engineer on site → Manual site assessment → Robot selection for this floor →
Safety review (checklists, back-and-forth) → Client sign-off → Launch package assembly
```

**Result:** Days of manual handoffs with context lost at every step. AMRs aren't cheap — idle robots waiting for go-live is the last thing clients want. A single missed constraint — wrong payload rating, inadequate Wi-Fi coverage, bad charger placement — can delay launch by weeks.

**We've lived this pain.** Every robotics deployment stalls because site assessment, fleet configuration, safety compliance, and launch approval happen in silos. There's no single coordination layer where these specialized functions can challenge each other, enforce constraints, and produce auditable artifacts.

---

## The Solution

Orizon Fleet Coordinator orchestrates **4 specialized AI agents** — each running a different framework and different open-source LLM via Featherless AI — collaborating through **Band's agentic mesh** to:

1. **Assess** the deployment site (floor plan, infrastructure, environmental constraints)
2. **Configure** the robot fleet (model selection via RAG, task assignment, waypoint planning)
3. **Review** safety compliance (ISO 3691-4 checklist with VETO authority)
4. **Package** the final deployment plan for human approval

The **safety veto loop** is the key differentiator: the Safety Reviewer can block deployment and force upstream agents to revise — visible in real-time as agents @mention each other, argue, and converge on a safe configuration.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BAND CHAT ROOM: #deploy-acme-motors                │
│                                                                             │
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────┐            │
│  │Site Assessor │───▶│Fleet Configurator│───▶│Safety Reviewer │            │
│  │  LangGraph   │    │     CrewAI       │    │   PydanticAI   │            │
│  │Qwen2.5-32B  │    │ Llama-3.1-70B    │    │  DeepSeek-R1   │            │
│  └──────────────┘    └──────────────────┘    └───────┬────────┘            │
│         ▲                                       VETO │ PASS                 │
│         │ revision request                           │                      │
│         └────────────────────────────────────────────┤                      │
│                                                      ▼                      │
│                                            ┌─────────────────┐             │
│                                            │Launch Coordinator│             │
│                                            │AnthropicAdapter  │             │
│                                            │ Qwen2.5-72B     │             │
│                                            └────────┬────────┘             │
│                                                     │                      │
│                                                     ▼                      │
│                                            ┌─────────────────┐             │
│                                            │  Ops Manager    │             │
│                                            │  (Human Gate)   │             │
│                                            └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Agent Specification

| Agent | Framework | Featherless Model | Role |
|-------|-----------|-------------------|------|
| **Site Assessor** | LangGraph | `Qwen/Qwen2.5-32B-Instruct` | Parse factory specs → structured assessment with infrastructure flags |
| **Fleet Configurator** | CrewAI + RAG | `meta-llama/Meta-Llama-3.1-70B-Instruct` | Robot catalog search → fleet composition, waypoints, charging schedules |
| **Safety Reviewer** | PydanticAI | `deepseek-ai/DeepSeek-R1-0528` | ISO 3691-4 compliance checklist. **Holds VETO authority.** |
| **Launch Coordinator** | AnthropicAdapter | `Qwen/Qwen2.5-72B-Instruct` | Synthesize approved artifacts → deployment-ready package |

**Why different models?** Each agent's task has different computational requirements:
- Site Assessor: fast structured extraction (32B is sufficient)
- Fleet Configurator: complex reasoning over robot catalog + past configs (70B)
- Safety Reviewer: rule-based logical evaluation with chain-of-thought (DeepSeek-R1, reasoning-optimized)
- Launch Coordinator: synthesis and document generation (72B for highest quality output)

---

## Band Platform Usage

This project demonstrates deep Band integration:

- **4 agents in one room** with `@mention` routing for directed handoffs
- **Safety veto → revision loop**: Safety Reviewer vetoes, @mentions Site Assessor back with required fixes, Site Assessor revises and re-submits
- **Dynamic recruitment**: Launch Coordinator uses `thenvoi_lookup_peers` to discover available agents
- **Structured events**: `thenvoi_send_event` for progress tracking (timeline visibility)
- **Human-in-the-loop gate**: Ops Manager receives final package and approves via dashboard

---

## Featherless AI Integration

All LLM inference runs through Featherless AI's OpenAI-compatible endpoint:

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="Qwen/Qwen2.5-32B-Instruct",
    base_url="https://api.featherless.ai/v1",
    api_key=os.environ["FEATHERLESS_API_KEY"],
)
```

**4 different open-source models** selected for task-specific performance across 4 agents. Featherless provides serverless inference — no GPU provisioning, no cold starts for popular models.

---

## Demo Workflow

### Deployment Mode (8-step coordination)

1. **Ops Manager triggers** → `@site-assessor` with Acme Motors factory spec
2. **Site Assessor analyzes** → flags Wi-Fi dead zone in Zone C NE, ramp gradient warning
3. **Fleet Configurator configures** → 8x HeavyLift-X200, waypoints, charging rotation
4. **Safety Reviewer VETOES** → Wi-Fi dead zone = safety hazard (lost connectivity = collision risk)
5. **Site Assessor revises** → adds Wi-Fi 6 AP to Zone C NE, coverage → 99.2%
6. **Safety Reviewer PASSES** → all checks cleared after remediation
7. **Launch Coordinator packages** → 3-day deployment timeline, audit hash
8. **Ops Manager approves** → deployment authorized

**The 5-15 day manual process becomes a ~10 minute coordinated agent workflow.**

### Fleet Ops Mode (Interactive Robot Simulator)

Switch to **Fleet Ops** mode to control 6 robots in real-time:

- **Adjust conditions** — battery level, speed, payload, zone assignment, status
- **Trigger events** — toggle obstacles, WiFi disconnections, error states
- **Watch robots communicate** — each change generates realistic robot-to-robot messages via Featherless AI
- **See fleet coordination** — robots reassign tasks, reroute around obstacles, manage charging priorities

This demonstrates what happens in production when fleet conditions change — robots in a Band chat room coordinate autonomously.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14, React 18, Tailwind CSS | Dashboard + agent chatroom visualization |
| Agent Coordination | Band (agentic mesh) | @mention routing, veto loops, events, human gates |
| LLM Inference | Featherless AI | 4 open-source models via OpenAI-compatible API |
| Agent Frameworks | LangGraph, CrewAI, PydanticAI, AnthropicAdapter | Cross-framework collaboration |
| Deployment | Vercel | Dashboard hosting |

---

## Getting Started

### Dashboard (Vercel)

```bash
# Clone the repository
git clone https://github.com/hildahost3000/orizon-robotics-fleet-deployment.git
cd orizon-robotics-fleet-deployment

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your FEATHERLESS_API_KEY (use promo code BOA26 for $25 credits)

# Run locally
npm run dev
# Open http://localhost:3000
```

### Band Agents (Local)

```bash
# Install Python dependencies
cd agents
pip install -r requirements.txt

# Configure Band credentials
cp agent_config.yaml.example agent_config.yaml
# Register 4 agents at app.band.ai → fill in UUIDs + API keys

# Run each agent in a separate terminal
python site_assessor.py
python fleet_configurator.py
python safety_reviewer.py
python launch_coordinator.py
```

### Band Setup

1. Sign up at [app.band.ai](https://app.band.ai) (use promo code `BANDHACK26` for Band Pro)
2. Register 4 External Agents (Site Assessor, Fleet Configurator, Safety Reviewer, Launch Coordinator)
3. Create a chat room: `#deploy-acme-motors`
4. Add all 4 agents to the room
5. Trigger: `@site-assessor [deployment request]`

---

## Domain Vocabulary

This project uses authentic robotics and fleet operations terminology:

| Term | Meaning |
|------|---------|
| **AMR** | Autonomous Mobile Robot — self-navigating material transport platform |
| **SLAM** | Simultaneous Localization and Mapping — real-time map building via LiDAR |
| **Waypoint** | Named coordinate in the facility map where robots perform actions |
| **WMS** | Warehouse Management System — dispatches tasks to fleet |
| **ISO 3691-4** | Safety standard for driverless industrial trucks |
| **FOC** | Field-Oriented Control — precision motor control for robot actuators |
| **Payload capacity** | Maximum load weight a robot can safely transport |
| **Charger dock** | Contact-based or inductive charging station for fleet rotation |
| **Geofence** | Virtual boundary restricting robot operation to safe zones |
| **Fleet uptime** | Percentage of robots operational vs. total fleet at any time |

---

## Future Vision

> I'm working toward Orizon Robotics — custom AMRs with FOC-controlled actuators (STM32-based motor drivers → custom wheels and robotic arm DOFs). This hackathon project is a working prototype: a training exercise and mental model for how I want client deployments to flow — assess, configure, veto, launch — before the hardware is ready.
>
> Today's demo uses simulated fleet data. The coordination pattern is what I'm validating — building the muscle memory now so the real ops layer is smoother later. When robots ship to client sites, I'd want this same workflow shape; from there, connecting live ROS2 telemetry, SLAM re-mapping, and fleet firmware updates is the natural next step — not something this MVP claims to do yet.

---

## Hackathon

**Band of Agents Hackathon** — Track 1: Internal Enterprise Workflows (with Track 3 safety gate flavor)

**Team:** athenarocks

- **Band** — Agent coordination mesh (multi-agent rooms, @mention routing, veto loops)
- **Featherless AI** — Serverless inference for 4 different open-source models
- **Cross-framework** — LangGraph + CrewAI + PydanticAI + AnthropicAdapter

---

## License

MIT
