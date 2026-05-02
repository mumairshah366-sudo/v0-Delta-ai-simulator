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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useOrgSimStore, getUniqueDepartments } from "@/lib/store"
import type { DecisionScope, PastSimulation, SimulationResult, ReactionType, PredictedReaction } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

const SCOPE_OPTIONS: { value: DecisionScope; label: string; icon: React.ReactNode }[] = [
  { value: "Company", label: "Company", icon: <Building2 className="h-4 w-4" /> },
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
  } = useOrgSimStore()

  const departments = getUniqueDepartments(teamMembers)

  const handleRunSimulation = async () => {
    if (!decisionText || !driId || teamMembers.length === 0) return

    setIsSimulating(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock simulation result - in production this would call an AI API
    const affectedMembers =
      decisionScope === "Company"
        ? teamMembers
        : decisionScope === "Department"
          ? teamMembers.filter((m) => m.department === selectedDepartment)
          : teamMembers.filter((m) => m.id === driId)

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

    const dri = teamMembers.find((m) => m.id === driId)

    const result: SimulationResult = {
      id: crypto.randomUUID(),
      decision: decisionText,
      scope: decisionScope,
      department: selectedDepartment,
      driId,
      overallRiskScore: riskScore,
      reactions,
      driBriefing: generateDriBriefing(dri?.name || "DRI", riskScore, reactions),
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

    setIsSimulating(false)
  }

  const canSimulate = decisionText && driId && teamMembers.length > 0

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground">Decision affects</Label>
        <ToggleGroup
          type="single"
          value={decisionScope}
          onValueChange={(value) => value && setDecisionScope(value as DecisionScope)}
          className="justify-start"
        >
          {SCOPE_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {option.icon}
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {decisionScope === "Department" && (
        <div className="space-y-2">
          <Label htmlFor="department">Select Department</Label>
          <Select value={selectedDepartment || ""} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
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

      <div className="space-y-2">
        <Label htmlFor="decision">What decision do you want to simulate?</Label>
        <Textarea
          id="decision"
          value={decisionText}
          onChange={(e) => setDecisionText(e.target.value)}
          placeholder="I want to mandate AI tool usage across the team"
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dri">Who is the DRI for this decision?</Label>
        <Select value={driId || ""} onValueChange={setDriId}>
          <SelectTrigger>
            <SelectValue placeholder="Select the decision owner" />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name} ({member.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleRunSimulation}
        disabled={!canSimulate || isSimulating}
        className="w-full h-12 text-base"
        size="lg"
      >
        {isSimulating ? (
          <>
            <Spinner className="mr-2" />
            Running Simulation...
          </>
        ) : (
          <>
            <Play className="h-5 w-5 mr-2" />
            Run Simulation
          </>
        )}
      </Button>
    </div>
  )
}

function generateBehaviors(reaction: ReactionType, status: string): string[] {
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
  if (statusBehaviors[status]) {
    base.push(statusBehaviors[status])
  }
  return base
}

function generateDriBriefing(driName: string, riskScore: number, reactions: PredictedReaction[]): string {
  const resistant = reactions.filter((r) => r.reaction === "Resistant").length
  const highRisk = reactions.filter((r) => r.isHighRisk).length

  if (riskScore < 30) {
    return `${driName}, this decision has a low risk profile. The team appears receptive. Focus on clear communication and setting expectations for timeline.`
  } else if (riskScore < 60) {
    return `${driName}, there are ${resistant} potentially resistant team members. Consider 1:1 conversations before the announcement. Pay special attention to the ${highRisk} high-risk individuals identified.`
  } else {
    return `${driName}, this decision carries significant risk. Recommend phased rollout with extensive stakeholder management. The ${resistant} resistant members need direct engagement, and ${highRisk} are flagged as high-risk for attrition.`
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
