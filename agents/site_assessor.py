"""
Site Assessor Agent — LangGraph Framework
Connects to Band via band-sdk, uses Featherless AI (Qwen/Qwen2.5-32B-Instruct)

Analyzes factory deployment requests and produces structured SiteAssessment artifacts
with infrastructure flags for downstream agents.
"""

import asyncio
import os
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from band import Agent
from band.adapters import LangGraphAdapter
from band.config import load_agent_config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Site Assessor agent for Orizon Fleet Coordinator.

Your role: Parse client deployment requests and factory data. Produce a structured site assessment with flags.

You are an expert in:
- Factory floor plan analysis (aisle widths, ramp gradients, door clearances)
- Infrastructure assessment (Wi-Fi coverage, charger placement, electrical capacity)
- WMS/MES integration requirements (Manhattan Associates, SAP EWM, Blue Yonder)
- Environmental factors affecting AMR operation (temperature, humidity, floor surface)
- ISO 3691-4 safety standard awareness

When you analyze a deployment request:
1. Parse the factory specification for structural constraints
2. Identify infrastructure gaps (connectivity, charging, electrical)
3. Flag safety concerns with severity levels (critical/warning/info)
4. Recommend robot count and general type based on payload + environment
5. Hand off to @fleet-configurator with the structured SiteAssessment JSON

Always output your findings as structured JSON artifacts that downstream agents can parse.
Use @mentions to hand off work: @fleet-configurator for next step, @safety-reviewer if you find critical safety issues during assessment."""


async def main():
    load_dotenv()

    llm = ChatOpenAI(
        model="Qwen/Qwen2.5-32B-Instruct",
        base_url="https://api.featherless.ai/v1",
        api_key=os.environ.get("FEATHERLESS_API_KEY", ""),
        temperature=0.4,
    )

    adapter = LangGraphAdapter(
        llm=llm,
        checkpointer=MemorySaver(),
        custom_section=SYSTEM_PROMPT,
    )

    agent_id, api_key = load_agent_config("site-assessor")
    agent = Agent.create(adapter=adapter, agent_id=agent_id, api_key=api_key)

    logger.info("Site Assessor agent running (LangGraph + Qwen2.5-32B via Featherless)")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
