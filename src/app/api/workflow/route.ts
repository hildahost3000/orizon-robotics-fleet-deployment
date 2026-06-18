import { NextRequest, NextResponse } from 'next/server'
import {
  runSiteAssessment,
  runFleetConfiguration,
  runSafetyReview,
  runRevision,
  runLaunchCoordinator,
} from '@/lib/workflow'
import { AgentMessage } from '@/lib/types'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { stage, siteAssessment, fleetConfig, safetyReview } = await request.json()
    const useLive = !!process.env.FEATHERLESS_API_KEY

    let messages: AgentMessage[] = []
    let artifact: Record<string, unknown> | undefined
    let vetoed = false

    switch (stage) {
      case 'site-assessment': {
        const result = await runSiteAssessment(useLive)
        messages = result.messages
        artifact = result.artifact
        break
      }
      case 'fleet-configuration': {
        const result = await runFleetConfiguration(siteAssessment, useLive)
        messages = result.messages
        artifact = result.artifact
        break
      }
      case 'safety-review': {
        const result = await runSafetyReview(siteAssessment, fleetConfig, useLive, false)
        messages = result.messages
        artifact = result.artifact
        vetoed = result.vetoed
        break
      }
      case 'revision': {
        const result = await runRevision(useLive)
        messages = result.messages
        break
      }
      case 'safety-review-revision': {
        const result = await runSafetyReview(siteAssessment, fleetConfig, useLive, true)
        messages = result.messages
        artifact = result.artifact
        vetoed = result.vetoed
        break
      }
      case 'launch-package': {
        const result = await runLaunchCoordinator(siteAssessment, fleetConfig, safetyReview, useLive)
        messages = result.messages
        artifact = result.artifact
        break
      }
      default:
        return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
    }

    return NextResponse.json({ messages, artifact, vetoed })
  } catch (error) {
    console.error('Workflow error:', error)
    return NextResponse.json(
      { error: 'Workflow execution failed', details: String(error) },
      { status: 500 }
    )
  }
}
