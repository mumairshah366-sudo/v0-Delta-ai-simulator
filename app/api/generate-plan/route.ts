import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { simulation, companyContext } = await req.json()

  const prompt = `You are an expert change management consultant.
Based on this simulation result, generate a detailed, 
actionable change management plan.

Simulation data:
- Decision: ${simulation.decision}
- Overall risk score: ${simulation.overallRiskScore}/100
- Biggest risk: ${simulation.biggestRisk}
- Team reactions: ${JSON.stringify(simulation.reactions.map((r: { member: { name: string; role: string }; reaction: string; confidence: number; isHighRisk: boolean }) => ({
    name: r.member.name,
    role: r.member.role,
    reaction: r.reaction,
    confidence: r.confidence,
    watchOut: r.isHighRisk
  })))}
- Recommended rollout: ${simulation.rolloutStrategy}
- DRI briefing: ${simulation.driBriefing}
Company context: ${companyContext || 'Not provided'}

Return ONLY valid JSON, no markdown:
{
  "title": "string",
  "executiveSummary": "string",
  "riskAssessment": [
    {
      "person": "string",
      "role": "string",
      "riskLevel": "High or Medium or Low",
      "reaction": "string",
      "action": "string"
    }
  ],
  "communicationStrategy": {
    "phase1": "string",
    "phase2": "string",
    "phase3": "string"
  },
  "rolloutTimeline": {
    "week1": ["string", "string", "string"],
    "week2": ["string", "string", "string"],
    "week3plus": ["string", "string", "string"]
  },
  "individualActions": [
    {
      "person": "string",
      "actions": ["string", "string"]
    }
  ],
  "successMetrics": ["string", "string", "string"],
  "driResponsibilities": ["string", "string", "string"]
}`

  const response = await fetch('https://api.vercel.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_AI_GATEWAY_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-6',
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  
  let parsed
  try {
    let clean = content
    if (content.includes('```json')) {
      clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }
    parsed = JSON.parse(clean.trim())
  } catch {
    parsed = { error: 'Failed to parse plan' }
  }

  return NextResponse.json(parsed)
}
