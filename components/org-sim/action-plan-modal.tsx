"use client"

import { useState } from "react"
import { FileText, Download, Copy, Check, Loader2, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { SimulationResult } from "@/lib/types"
import { useDeltaStore } from "@/lib/store"

interface ActionPlan {
  title: string
  executiveSummary: string
  riskAssessment: {
    person: string
    role: string
    riskLevel: "High" | "Medium" | "Low"
    reaction: string
    action: string
  }[]
  communicationStrategy: {
    phase1: string
    phase2: string
    phase3: string
  }
  rolloutTimeline: {
    week1: string[]
    week2: string[]
    week3plus: string[]
  }
  individualActions: {
    person: string
    actions: string[]
  }[]
  successMetrics: string[]
  driResponsibilities: string[]
  error?: string
}

function getRiskRowColor(level: string) {
  switch (level) {
    case "High": return "bg-red-50"
    case "Medium": return "bg-amber-50"
    case "Low": return "bg-emerald-50"
    default: return ""
  }
}

function getRiskBadgeColor(level: string) {
  switch (level) {
    case "High": return "bg-red-100 text-red-700 border-red-200"
    case "Medium": return "bg-amber-100 text-amber-700 border-amber-200"
    case "Low": return "bg-emerald-100 text-emerald-700 border-emerald-200"
    default: return ""
  }
}

export function ActionPlanModal({ simulation }: { simulation: SimulationResult }) {
  const { companyContext } = useDeltaStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [plan, setPlan] = useState<ActionPlan | null>(null)
  const [copied, setCopied] = useState(false)
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({})

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const generatePlan = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      console.log('[v0] Generating action plan for simulation:', {
        decision: simulation.decision,
        riskScore: simulation.overallRiskScore,
        reactions: simulation.reactions.length,
        companyContext: companyContext ? 'provided' : 'none'
      })

      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulation, companyContext }),
      })

      console.log('[v0] Action plan API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[v0] Action plan API error:', errorText)
        throw new Error(`API returned ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('[v0] Action plan generated successfully:', data.title)
      setPlan(data)
    } catch (error) {
      console.error('[v0] Failed to generate plan:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      setErrorMessage(`Failed to generate plan. ${message}`)
      setPlan(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpen = (open: boolean) => {
    setIsOpen(open)
    if (open && !plan) {
      generatePlan()
    }
  }

  const copyToClipboard = () => {
    if (!plan) return
    
    const text = `
${plan.title}
==================

EXECUTIVE SUMMARY
${plan.executiveSummary}

RISK ASSESSMENT
${plan.riskAssessment?.map(r => `- ${r.person} (${r.role}): ${r.riskLevel} risk, ${r.reaction}. Action: ${r.action}`).join('\n') || 'N/A'}

COMMUNICATION STRATEGY
Phase 1: ${plan.communicationStrategy?.phase1 || 'N/A'}
Phase 2: ${plan.communicationStrategy?.phase2 || 'N/A'}
Phase 3: ${plan.communicationStrategy?.phase3 || 'N/A'}

ROLLOUT TIMELINE
Week 1:
${plan.rolloutTimeline?.week1?.map(t => `- ${t}`).join('\n') || 'N/A'}

Week 2:
${plan.rolloutTimeline?.week2?.map(t => `- ${t}`).join('\n') || 'N/A'}

Week 3+:
${plan.rolloutTimeline?.week3plus?.map(t => `- ${t}`).join('\n') || 'N/A'}

INDIVIDUAL ACTIONS
${plan.individualActions?.map(ia => `${ia.person}:\n${ia.actions?.map(a => `  - ${a}`).join('\n')}`).join('\n\n') || 'N/A'}

SUCCESS METRICS
${plan.successMetrics?.map((m, i) => `${i + 1}. ${m}`).join('\n') || 'N/A'}

DRI RESPONSIBILITIES
${plan.driResponsibilities?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'N/A'}
`.trim()

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const toggleAccordion = (person: string) => {
    setOpenAccordions(prev => ({ ...prev, [person]: !prev[person] }))
  }

  // Filter to only show resistant/high risk people in individual actions
  const resistantPeople = plan?.individualActions?.filter(ia => {
    const assessment = plan.riskAssessment?.find(r => r.person === ia.person)
    return assessment?.riskLevel === "High" || assessment?.reaction?.toLowerCase().includes("resistant")
  }) || []

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <FileText className="h-4 w-4 mr-2" />
          Generate Action Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 print:max-w-none print:max-h-none print:h-auto">
        <div className="print:hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg">
                {isLoading ? "Generating plan..." : plan?.title || "Change Management Plan"}
              </DialogTitle>
              {plan && !plan.error && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Generating your action plan...</p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="p-6">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-center">
              <p className="text-sm text-red-700 font-medium mb-2">Failed to generate plan</p>
              <p className="text-xs text-red-600 mb-4">{errorMessage}</p>
              <Button variant="outline" size="sm" onClick={generatePlan}>
                Try Again
              </Button>
            </div>
          </div>
        ) : plan?.error ? (
          <div className="p-6 text-center text-red-600">
            {plan.error}
          </div>
        ) : plan ? (
          <ScrollArea className="h-[70vh] print:h-auto print:overflow-visible">
            <div className="p-6 space-y-6 print:space-y-8" id="action-plan-content">
              {/* Print header - only visible when printing */}
              <div className="hidden print:block mb-8">
                <h1 className="text-2xl font-bold">{plan.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">Generated by Delta - AI Decision Simulator</p>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-muted/50 border">
                <h3 className="text-sm font-semibold mb-2 text-foreground">Executive Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{plan.executiveSummary}</p>
              </div>

              {/* Risk Assessment Table */}
              {plan.riskAssessment && plan.riskAssessment.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Risk Assessment</h3>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Person</th>
                          <th className="text-left p-3 font-medium">Role</th>
                          <th className="text-left p-3 font-medium">Risk</th>
                          <th className="text-left p-3 font-medium">Predicted Reaction</th>
                          <th className="text-left p-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.riskAssessment.map((row, i) => (
                          <tr key={i} className={`border-t ${getRiskRowColor(row.riskLevel)}`}>
                            <td className="p-3 font-medium">{row.person}</td>
                            <td className="p-3 text-muted-foreground">{row.role}</td>
                            <td className="p-3">
                              <Badge variant="outline" className={getRiskBadgeColor(row.riskLevel)}>
                                {row.riskLevel}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">{row.reaction}</td>
                            <td className="p-3 text-muted-foreground">{row.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Communication Strategy */}
              {plan.communicationStrategy && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Communication Strategy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border bg-blue-50/50">
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Phase 1</span>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{plan.communicationStrategy.phase1}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-purple-50/50">
                      <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">Phase 2</span>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{plan.communicationStrategy.phase2}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-emerald-50/50">
                      <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Phase 3</span>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{plan.communicationStrategy.phase3}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rollout Timeline */}
              {plan.rolloutTimeline && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Rollout Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border">
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">Week 1</span>
                      <ul className="mt-3 space-y-2">
                        {plan.rolloutTimeline.week1?.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-primary">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">Week 2</span>
                      <ul className="mt-3 space-y-2">
                        {plan.rolloutTimeline.week2?.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-primary">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl border">
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">Week 3+</span>
                      <ul className="mt-3 space-y-2">
                        {plan.rolloutTimeline.week3plus?.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-primary">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Actions - Only show resistant/high risk */}
              {resistantPeople.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Individual Actions (High Risk)</h3>
                  <div className="space-y-2">
                    {resistantPeople.map((ia) => (
                      <Collapsible 
                        key={ia.person} 
                        open={openAccordions[ia.person]} 
                        onOpenChange={() => toggleAccordion(ia.person)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-3 rounded-lg border bg-red-50/50 hover:bg-red-50 transition-colors">
                            <span className="font-medium text-sm">{ia.person}</span>
                            {openAccordions[ia.person] ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ul className="p-3 pl-6 space-y-2 border-x border-b rounded-b-lg">
                            {ia.actions?.map((action, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-red-500">•</span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Metrics */}
              {plan.successMetrics && plan.successMetrics.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Success Metrics</h3>
                  <ol className="space-y-2 pl-1">
                    {plan.successMetrics.map((metric, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                          {i + 1}
                        </span>
                        {metric}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* DRI Responsibilities */}
              {plan.driResponsibilities && plan.driResponsibilities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">DRI Responsibilities</h3>
                  <ol className="space-y-2 pl-1">
                    {plan.driResponsibilities.map((resp, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-medium">
                          {i + 1}
                        </span>
                        {resp}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #action-plan-content,
          #action-plan-content * {
            visibility: visible;
          }
          #action-plan-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </Dialog>
  )
}
