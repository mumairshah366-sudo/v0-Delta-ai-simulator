"use client"

import { Play, Building2, Users2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDeltaStore, getUniqueDepartments } from "@/lib/store"
import type { DecisionScope, PastSimulation, SimulationResult, ReactionType, PredictedReaction } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

const SCOPE_OPTIONS: { value: DecisionScope; label: string; icon: React.ReactNode }[] = [
  { value: "Company", label: "Company-wide", icon: <Building2 className="h-4 w-4" /> },
  { value: "Department", label: "Department", icon: <Users2 className="h-4 w-4" /> },
  { value: "Individual", label: "Individual", icon: <User className="h-4 w-4" /> },
]

export function SimulationForm() {
  const {
    teamMembers,
    decisionScope,
    setDecisionScope,
    selectedDepartment,
    setSelectedDepartment,
    decisionText,
    setDecisionText,
    driId,
    setDriId,
    isSimulating,
    setIsSimulating,
    setCurrentSimulation,
    addPastSimulation,
    companyContext,
  } = useDeltaStore()

  const departments = getUniqueDepartments(teamMembers)

  const handleRunSimulation = async () => {
    if (!decisionText || teamMembers.length === 0) return

    setIsSimulating(true)

    const affectedMembers =
      decisionScope === "Company"
        ? teamMembers
        : decisionScope === "Department"
          ? teamMembers.filter((m) => m.department === selectedDepartment)
          : teamMembers.filter((m) => m.id === driId)

    const dri = teamMembers.find((m) => m.id === driId)

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          members: affectedMembers.map((m) => ({
            name: m.name,
            role: m.role,
            department: m.department,
            seniority: m.seniority,
            status: m.status,
            npsScore: m.npsScore,
            notes: m.notes,
            yearsAtCompany: Math.floor(
              (Date.now() - new Date(m.joiningDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
            ),
            isManager: m.reporteeIds.length > 0,
            reporteeCount: m.reporteeIds.length,
          })),
          decision: decisionText,
          scope: decisionScope,
          dri: dri ? { name: dri.name, role: dri.role } : null,
          companyContext,
        }),
      })

      const aiResult = await response.json()

      // Map AI response to our types
      const reactions: PredictedReaction[] = affectedMembers.map((member) => {
        const aiMember = aiResult.members?.find(
          (m: { name: string }) => m.name === member.name
        )
        
        const isHighRisk =
          member.status === "On PIP" ||
          member.status === "At risk of leaving" ||
          member.status === "No raise 3+ months" ||
          aiMember?.watch_out === true

        return {
          memberId: member.id,
          member,
          reaction: (aiMember?.reaction as ReactionType) || "Neutral",
          confidence: aiMember?.confidence || 70,
          predictedBehaviors: aiMember?.predicted_behaviours || generateBehaviors("Neutral", member.status),
          isHighRisk,
          reasoning: aiMember?.reasoning,
          whatTheyNeed: aiMember?.what_they_need,
        }
      })

      const riskScore = aiResult.overall_risk_score || Math.min(
        100,
        Math.floor(
          (reactions.filter((r) => r.reaction === "Resistant").length / reactions.length) * 100 +
            reactions.filter((r) => r.isHighRisk).length * 5
        )
      )

      const result: SimulationResult = {
        id: crypto.randomUUID(),
        decision: decisionText,
        scope: decisionScope,
        department: selectedDepartment,
        driId,
        overallRiskScore: riskScore,
        reactions,
        driBriefing: aiResult.dri_briefing || generateDriBriefing(dri?.name || null, riskScore, reactions),
        suggestedApproach: aiResult.recommendations || generateApproach(riskScore),
        rolloutStrategy: aiResult.rollout_strategy || generateRolloutStrategy(decisionScope, reactions),
        biggestRisk: aiResult.biggest_risk,
        createdAt: new Date(),
      }

      setCurrentSimulation(result)

      const pastSim: PastSimulation = {
        id: result.id,
        decision: decisionText,
        scope: decisionScope,
        riskScore,
        createdAt: new Date(),
      }
      addPastSimulation(pastSim)
    } catch (error) {
      console.error('Simulation failed:', error)
      // Fallback to mock if API fails
      const reactions: PredictedReaction[] = affectedMembers.map((member) => {
        const isHighRisk =
          member.status === "On PIP" ||
          member.status === "At risk of leaving" ||
          member.status === "No raise 3+ months"

        const reactionTypes: ReactionType[] = ["Supportive", "Neutral", "Resistant"]
        const reactionWeights = isHighRisk ? [0.2, 0.3, 0.5] : [0.5, 0.3, 0.2]
        const rand = Math.random()
        let reaction: ReactionType = "Neutral"
        if (rand < reactionWeights[0]) reaction = "Supportive"
        else if (rand < reactionWeights[0] + reactionWeights[1]) reaction = "Neutral"
        else reaction = "Resistant"

        return {
          memberId: member.id,
          member,
          reaction,
          confidence: Math.floor(60 + Math.random() * 35),
          predictedBehaviors: generateBehaviors(reaction, member.status),
          isHighRisk,
        }
      })

      const riskScore = Math.min(
        100,
        Math.floor(
          (reactions.filter((r) => r.reaction === "Resistant").length / reactions.length) * 100 +
            reactions.filter((r) => r.isHighRisk).length * 5
        )
      )

      const result: SimulationResult = {
        id: crypto.randomUUID(),
        decision: decisionText,
        scope: decisionScope,
        department: selectedDepartment,
        driId,
        overallRiskScore: riskScore,
        reactions,
        driBriefing: generateDriBriefing(dri?.name || null, riskScore, reactions),
        suggestedApproach: generateApproach(riskScore),
        rolloutStrategy: generateRolloutStrategy(decisionScope, reactions),
        createdAt: new Date(),
      }

      setCurrentSimulation(result)

      const pastSim: PastSimulation = {
        id: result.id,
        decision: decisionText,
        scope: decisionScope,
        riskScore,
        createdAt: new Date(),
      }
      addPastSimulation(pastSim)
    } finally {
      setIsSimulating(false)
    }
  }

  const canSimulate = decisionText && teamMembers.length > 0

  return (
    <div className="space-y-6">
      {/* Scope Selection */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Decision Scope
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {SCOPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setDecisionScope(option.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                decisionScope === option.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background hover:border-primary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.icon}
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {decisionScope === "Department" && (
        <div className="space-y-2">
          <Label htmlFor="department" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Select Department
          </Label>
          <Select value={selectedDepartment || ""} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Choose a department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Decision Text */}
      <div className="space-y-2">
        <Label htmlFor="decision" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Decision to Simulate
        </Label>
        <Textarea
          id="decision"
          value={decisionText}
          onChange={(e) => setDecisionText(e.target.value)}
          placeholder="e.g., Mandate AI tool usage across the team"
          rows={4}
          className="resize-none text-sm"
        />
      </div>

      {/* Decision Implementor Selection */}
      <div className="space-y-2">
        <Label htmlFor="dri" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Decision Implementor (DRI) — Optional
        </Label>
        <Select value={driId || "none"} onValueChange={(value) => setDriId(value === "none" ? null : value)}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select an implementor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground">No specific owner / Company decision</span>
            </SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                <span className="font-medium">{member.name}</span>
                <span className="text-muted-foreground ml-1">({member.role})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Run Button */}
      <Button
        onClick={handleRunSimulation}
        disabled={!canSimulate || isSimulating}
        className="w-full h-12 text-sm font-medium"
        size="lg"
      >
        {isSimulating ? (
          <>
            <Spinner className="mr-2" />
            Running Simulation...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run Simulation
          </>
        )}
      </Button>

      {teamMembers.length === 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Add team members to run a simulation
        </p>
      )}
    </div>
  )
}

function generateBehaviors(reaction: ReactionType, status: string | null): string[] {
  const behaviors: Record<ReactionType, string[]> = {
    Supportive: [
      "Will likely advocate for the change in team discussions",
      "May volunteer to pilot or lead implementation",
      "Could help onboard resistant team members",
    ],
    Neutral: [
      "Will comply but may need additional context",
      "Unlikely to advocate but won't actively resist",
      "May wait to see how others respond first",
    ],
    Resistant: [
      "May voice concerns in meetings or 1:1s",
      "Could slow adoption through passive resistance",
      "Might escalate concerns to leadership",
    ],
  }

  const statusBehaviors: Record<string, string> = {
    "On PIP": "Currently under performance review - change may add stress",
    "At risk of leaving": "Already considering alternatives - may accelerate departure",
    "No raise 3+ months": "Feeling undervalued - may interpret change negatively",
    "High performer": "High influence on team - reaction will affect others",
    "New joiner": "Still learning culture - more adaptable to change",
    "Recently Promoted": "Invested in current trajectory - change may feel destabilizing",
  }

  const base = behaviors[reaction].slice(0, 2)
  if (status && statusBehaviors[status]) {
    base.push(statusBehaviors[status])
  }
  return base
}

function generateDriBriefing(driName: string | null, riskScore: number, reactions: PredictedReaction[]): string {
  const resistant = reactions.filter((r) => r.reaction === "Resistant").length
  const highRisk = reactions.filter((r) => r.isHighRisk).length
  const addressee = driName || "Leadership"

  if (riskScore < 30) {
    return `${addressee}, this decision has a low risk profile. The team appears receptive. Focus on clear communication and setting expectations for timeline.`
  } else if (riskScore < 60) {
    return `${addressee}, there are ${resistant} potentially resistant team members. Consider 1:1 conversations before the announcement. Pay special attention to the ${highRisk} high-risk individuals identified.`
  } else {
    return `${addressee}, this decision carries significant risk. Recommend phased rollout with extensive stakeholder management. The ${resistant} resistant members need direct engagement, and ${highRisk} are flagged as high-risk for attrition.`
  }
}

function generateApproach(riskScore: number): string[] {
  if (riskScore < 30) {
    return [
      "Announce in team meeting with clear rationale",
      "Provide FAQ document addressing common concerns",
      "Set up feedback channel for ongoing questions",
    ]
  } else if (riskScore < 60) {
    return [
      "Brief key stakeholders individually before announcement",
      "Frame decision with context on business drivers",
      "Create transition period with support resources",
    ]
  } else {
    return [
      "Conduct 1:1s with high-risk individuals first",
      "Consider pilot program before full rollout",
      "Establish clear escalation path for concerns",
    ]
  }
}

function generateRolloutStrategy(scope: DecisionScope, reactions: PredictedReaction[]): string {
  const supportive = reactions.filter((r) => r.reaction === "Supportive")
  const departments = [...new Set(reactions.map((r) => r.member.department))]

  if (scope === "Company") {
    return `Start with ${supportive.length > 0 ? `high performers in ${supportive[0]?.member.department || "Engineering"}` : "willing adopters"}, then expand to ${departments.slice(0, 2).join(" and ")}. Avoid announcing during review season or major project deadlines.`
  } else if (scope === "Department") {
    return `Begin with team leads and senior members to establish buy-in. Roll out to remaining team in 2-week phases. Schedule implementation between sprint cycles.`
  } else {
    return `Work directly with the individual through their manager. Provide dedicated support and check-in schedule. Document progress for broader rollout consideration.`
  }
}
