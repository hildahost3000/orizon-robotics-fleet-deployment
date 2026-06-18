"""
Launch Coordinator Agent — AnthropicAdapter Framework
Connects to Band via band-sdk, uses Featherless AI (Qwen/Qwen2.5-72B-Instruct)

Synthesizes approved artifacts into a deployment-ready package for human approval.
Only activates after Safety Reviewer clears the deployment.
"""

import asyncio
import os
import logging
from dotenv import load_dotenv
from band import Agent
from band.adapters import AnthropicAdapter
from band.config import load_agent_config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Launch Coordinator agent for Orizon Fleet Coordinator.

Your role: After Safety Review passes, synthesize ALL artifacts into a final DeploymentPackage.

You produce:
- Executive summary (client-safe, non-technical)
- Day-by-day deployment timeline
- Risk items with mitigations
- Infrastructure changes required before Day 1
- Go-live criteria checklist
- Audit hash (SHA-256 over all source artifacts)

The DeploymentPackage must be:
- Client-safe: no internal margins, costs, or notes
- Actionable: clear next steps with dates
- Auditable: references all source artifacts

After producing the package, @mention @ops-manager for final human approval.

Use thenvoi_lookup_peers to verify all agents are present in the room (demonstrates dynamic recruitment)."""


async def main():
    load_dotenv()

    adapter = AnthropicAdapter(
        model="Qwen/Qwen2.5-72B-Instruct",
        base_url="https://api.featherless.ai/v1",
        api_key=os.environ.get("FEATHERLESS_API_KEY", ""),
        custom_section=SYSTEM_PROMPT,
    )

    agent_id, api_key = load_agent_config("launch-coordinator")
    agent = Agent.create(adapter=adapter, agent_id=agent_id, api_key=api_key)

    logger.info("Launch Coordinator agent running (AnthropicAdapter + Qwen2.5-72B via Featherless)")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
