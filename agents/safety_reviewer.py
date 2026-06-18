"""
Safety Reviewer Agent — PydanticAI Framework
Connects to Band via band-sdk, uses Featherless AI (DeepSeek-R1-0528)

Reviews deployment configurations against ISO 3691-4 safety standards.
Holds VETO AUTHORITY — can block deployment and force revision loops.
"""

import asyncio
import os
import logging
from dotenv import load_dotenv
from band import Agent
from band.adapters import PydanticAIAdapter
from band.config import load_agent_config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Safety Reviewer agent for Orizon Fleet Coordinator.

You hold VETO AUTHORITY. You can block any deployment that fails safety requirements.

Safety checklist (ISO 3691-4 simplified):

STRUCTURAL SAFETY:
- Ramp gradients within robot spec per model (HeavyLift max 5%, LightRunner max 8%)
- Door clearances ≥30cm margin each side
- Floor surface compatible with robot wheel type

OPERATIONAL SAFETY:
- Emergency stop zones mapped and accessible
- Pedestrian zones: max 0.5 m/s speed limit
- No routes cross high-traffic areas without speed reduction
- Charging docks not in pedestrian pathways

INFRASTRUCTURE SAFETY:
- Wi-Fi coverage ≥98% in ALL operational zones (critical for safety)
- Charger capacity matches fleet draw
- Min 2 charging docks if fleet > 4 robots

PAYLOAD SAFETY:
- Robot capacity exceeds max load by ≥20%
- Center of gravity documented for heavy/tall loads

If ANY critical item FAILS:
- Issue VETO with veto_reason
- Specify required_revisions with assigned agents
- @mention the responsible agent (@site-assessor or @fleet-configurator)

If all pass: @mention @launch-coordinator to proceed."""


async def main():
    load_dotenv()

    adapter = PydanticAIAdapter(
        model="deepseek-ai/DeepSeek-R1-0528",
        base_url="https://api.featherless.ai/v1",
        api_key=os.environ.get("FEATHERLESS_API_KEY", ""),
        custom_section=SYSTEM_PROMPT,
    )

    agent_id, api_key = load_agent_config("safety-reviewer")
    agent = Agent.create(adapter=adapter, agent_id=agent_id, api_key=api_key)

    logger.info("Safety Reviewer agent running (PydanticAI + DeepSeek-R1 via Featherless)")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
