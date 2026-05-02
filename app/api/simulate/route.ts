import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { members, decision, scope, dri, companyContext } = await req.json()

  const systemPrompt = `You are an organisational psychology simulator. 
You predict how individual employees will react to company decisions 
based on their personal context. Analyse each person's status, seniority, 
NPS score, notes, time at company, and relationship to the DRI.
Return ONLY valid JSON with no markdown or explanation:
{
  "members": [
    {
      "name": "string",
      "role": "string", 
      "reaction": "Supportive" | "Neutral" | "Resistant",
      "confidence": 0-100,
      "reasoning": "string",
      "predicted_behaviours": ["string", "string", "string"],
      "watch_out": true or false,
      "what_they_need": "string"
    }
  ],
  "overall_risk_score": 0-100,
  "biggest_risk": "string",
  "rollout_strategy": "string",
  "dri_briefing": "string",
  "recommendations": ["string", "string", "string"]
}`

  const userPrompt = `Team members: ${JSON.stringify(members)}
Decision: ${decision}
Scope: ${scope}
DRI: ${dri || 'No specific owner - company decision'}
Company context: ${companyContext || 'None provided'}`

  try {
    const aiResponse = await fetch('https://api.vercel.com/v1/ai/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_AI_GATEWAY_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-6',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    })

    const aiData = await aiResponse.json()
    const content = aiData.choices?.[0]?.message?.content || '{}'
    
    // Parse the JSON response, handling potential markdown code blocks
    let jsonContent = content
    if (content.includes('```json')) {
      jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (content.includes('```')) {
      jsonContent = content.replace(/```\n?/g, '')
    }
    
    const result = JSON.parse(jsonContent.trim())

    // Mubit memory - fire and forget
    fetch('https://api.mubit.ai/v1/learn', {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${process.env.MUBIT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent_id: 'orgsim',
        input: { members, decision, scope },
        output: result
      })
    }).catch(() => {}) // don't block if Mubit fails

    return NextResponse.json(result)
  } catch (error) {
    console.error('Simulation error:', error)
    return NextResponse.json(
      { error: 'Failed to run simulation' },
      { status: 500 }
    )
  }
}
