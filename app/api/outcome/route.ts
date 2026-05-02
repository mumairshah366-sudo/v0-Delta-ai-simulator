import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { simulationId, decision, actualOutcome, overallResult, memberOutcomes } = await req.json()

  // Send to Mubit as learning signal
  try {
    await fetch('https://api.mubit.ai/v1/learn', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MUBIT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent_id: 'delta',
        input: { 
          simulationId, 
          decision,
          type: 'outcome_feedback'
        },
        output: { 
          actualOutcome, 
          overallResult, 
          memberOutcomes,
          lesson: `Decision "${decision}" resulted in: ${overallResult}. Individual outcomes: ${JSON.stringify(memberOutcomes)}`
        }
      })
    })
  } catch (error) {
    console.error('Failed to send to Mubit:', error)
    // Don't fail the request if Mubit fails
  }

  return NextResponse.json({ success: true })
}
