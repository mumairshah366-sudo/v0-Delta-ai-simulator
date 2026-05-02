"use client"

import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  TrendingUp,
  Lightbulb,
  Calendar,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useOrgSimStore, calculateYearsAtCompany } from "@/lib/store"
import type { ReactionType, PredictedReaction } from "@/lib/types"

function getReactionIcon(reaction: ReactionType) {
  switch (reaction) {
    case "Supportive":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    case "Neutral":
      return <HelpCircle className="h-4 w-4 text-sky-400" />
    case "Resistant":
      return <XCircle className="h-4 w-4 text-red-400" />
  }
}

function getReactionColor(reaction: ReactionType): string {
  switch (reaction) {
    case "Supportive":
      return "bg-emerald-500"
    case "Neutral":
      return "bg-sky-500"
    case "Resistant":
      return "bg-red-500"
  }
}

function getRiskGaugeColor(score: number): string {
  if (score < 30) return "bg-emerald-500"
  if (score < 60) return "bg-amber-500"
  return "bg-red-500"
}

function ReactionCard({ prediction }: { prediction: PredictedReaction }) {
  const years = calculateYearsAtCompany(prediction.member.joiningDate)

  return (
    <div className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getReactionIcon(prediction.reaction)}
          <div>
            <p className="font-medium text-foreground text-sm">
              {prediction.member.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {prediction.member.role} · {years}y at company
            </p>
          </div>
        </div>
        {prediction.isHighRisk && (
          <Badge
            variant="outline"
            className="bg-red-500/20 text-red-400 border-red-500/30 text-xs"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Watch
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-muted-foreground w-16">
          {prediction.reaction}
        </span>
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full ${getReactionColor(prediction.reaction)} transition-all`}
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground w-10 text-right">
          {prediction.confidence}%
        </span>
      </div>

      <ul className="space-y-1">
        {prediction.predictedBehaviors.map((behavior, i) => (
          <li key={i} className="text-xs text-muted-foreground flex gap-2">
            <span className="text-primary">•</span>
            {behavior}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SimulationResults() {
  const { currentSimulation, teamMembers } = useOrgSimStore()

  if (!currentSimulation) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Run a simulation to see results</p>
          <p className="text-xs mt-1">
            Add team members and describe your decision
          </p>
        </div>
      </div>
    )
  }

  const dri = teamMembers.find((m) => m.id === currentSimulation.driId)
  const { overallRiskScore, reactions, driBriefing, suggestedApproach, rolloutStrategy } =
    currentSimulation

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Overall Risk Score */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              Overall Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-secondary"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(overallRiskScore / 100) * 251.2} 251.2`}
                    className={
                      overallRiskScore < 30
                        ? "text-emerald-500"
                        : overallRiskScore < 60
                          ? "text-amber-500"
                          : "text-red-500"
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">
                    {overallRiskScore}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  {overallRiskScore < 30
                    ? "Low risk - Team is generally receptive"
                    : overallRiskScore < 60
                      ? "Moderate risk - Some concerns to address"
                      : "High risk - Significant resistance expected"}
                </p>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">
                      {reactions.filter((r) => r.reaction === "Supportive").length} Supportive
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                    <span className="text-muted-foreground">
                      {reactions.filter((r) => r.reaction === "Neutral").length} Neutral
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">
                      {reactions.filter((r) => r.reaction === "Resistant").length} Resistant
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DRI Briefing */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-accent/20">
                <Lightbulb className="h-4 w-4 text-accent" />
              </div>
              DRI Briefing
              {dri && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {dri.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {driBriefing}
            </p>
          </CardContent>
        </Card>

        {/* Suggested Approach */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Suggested Approach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {suggestedApproach.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Rollout Strategy */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              Rollout Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {rolloutStrategy}
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Predicted Reactions */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4">
            Predicted Reactions ({reactions.length} people)
          </h3>
          <div className="space-y-3">
            {reactions.map((prediction) => (
              <ReactionCard key={prediction.memberId} prediction={prediction} />
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
