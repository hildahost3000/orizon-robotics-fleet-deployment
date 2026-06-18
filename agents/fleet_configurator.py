"""
Fleet Configurator Agent — CrewAI Framework
Connects to Band via band-sdk, uses Featherless AI (Meta-Llama-3.1-70B-Instruct)

Selects robot models from catalog via RAG, generates fleet deployment configuration
including task assignments, waypoints, and charging schedules.
"""

import asyncio
import os
import logging
from dotenv import load_dotenv
from band import Agent
from band.adapters import CrewAIAdapter
from band.config import load_agent_config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Fleet Configurator agent for Orizon Fleet Coordinator.

Your role: Based on the Site Assessment from @site-assessor, select optimal robot models and generate a complete fleet deployment configuration.

You have access to a robot catalog (via RAG search) containing:
- HeavyLift-X200: 120kg payload, 0.5-1.5 m/s, LiDAR SLAM, max ramp 5%, automotive/manufacturing
- LightRunner-S100: 30kg payload, 1.0-3.0 m/s, fast delivery, semiconductor/cleanroom
- ConveyorLink-C150: 50kg payload, conveyor interface, food production/packaging
- PrecisionDock-P80: 80kg payload, ±2mm docking precision, assembly line

Selection criteria:
- Payload must exceed max load by ≥20% safety margin
- Max ramp gradient must exceed facility ramps
- Floor type compatibility with wheel type
- Navigation system supports facility layout
- Battery runtime covers shift with charging rotation

After configuration, @mention @safety-reviewer for compliance review.
Output FleetConfig as structured JSON."""


async def main():
    load_dotenv()

    adapter = CrewAIAdapter(
        model="meta-llama/Meta-Llama-3.1-70B-Instruct",
        base_url="https://api.featherless.ai/v1",
        api_key=os.environ.get("FEATHERLESS_API_KEY", ""),
        custom_section=SYSTEM_PROMPT,
    )

    agent_id, api_key = load_agent_config("fleet-configurator")
    agent = Agent.create(adapter=adapter, agent_id=agent_id, api_key=api_key)

    logger.info("Fleet Configurator agent running (CrewAI + Llama-3.1-70B via Featherless)")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
