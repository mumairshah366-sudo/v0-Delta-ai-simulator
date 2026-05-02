import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { simulation, companyContext } = await req.json()

  const systemPrompt = `You are an expert change management consultant. Return ONLY valid JSON, no markdown, no explanation, no code blocks.`

  const userPrompt = `Based on this simulation result, generate a detailed actionable change management plan.

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
- Company context: ${companyContext || 'Not provided'}

Return this exact JSON structure:
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

  try {
    const aiResponse = await fetch('https://api.vercel.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_AI_GATEWAY_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
      })
    })

    const rawText = await aiResponse.text()
    console.log('Generate plan status:', aiResponse.status)
    console.log('Generate plan response:', rawText.slice(0, 500))

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: `Gateway failed ${aiResponse.status}: ${rawText.slice(0, 200)}` },
        { status: 500 }
      )
    }

    if (!rawText || rawText.trim() === '') {
      return NextResponse.json(
        { error: 'Gateway returned empty response' },
        { status: 500 }
      )
    }

    const aiData = JSON.parse(rawText)
    const content = aiData.choices?.[0]?.message?.content || '{}'
    
    let jsonContent = content
    if (content.includes('```json')) {
      jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (content.includes('```')) {
      jsonContent = content.replace(/```\n?/g, '')
    }
    
    const result = JSON.parse(jsonContent.trim())
    return NextResponse.json(result)

  } catch (error) {
    console.error('Generate plan error:', error)
    return NextResponse.json(
      { error: `Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}