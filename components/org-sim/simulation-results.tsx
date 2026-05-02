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
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDeltaStore, calculateYearsAtCompany } from "@/lib/store"
import type { ReactionType, PredictedReaction } from "@/lib/types"
import { ActionPlanModal } from "./action-plan-modal"

function getReactionIcon(reaction: ReactionType) {
  switch (reaction) {
    case "Supportive":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    case "Neutral":
      return <HelpCircle className="h-4 w-4 text-sky-600" />
    case "Resistant":
      return <XCircle className="h-4 w-4 text-red-600" />
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

function ReactionCard({ prediction }: { prediction: PredictedReaction }) {
  const years = calculateYearsAtCompany(prediction.member.joiningDate)

  return (
    <div className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            prediction.reaction === "Supportive" ? "bg-emerald-100" :
            prediction.reaction === "Neutral" ? "bg-sky-100" : "bg-red-100"
          }`}>
            {getReactionIcon(prediction.reaction)}
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">
              {prediction.member.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {prediction.member.role} · {years}y tenure
            </p>
          </div>
        </div>
        {prediction.isHighRisk && (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 text-xs"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Watch
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          prediction.reaction === "Supportive" ? "bg-emerald-100 text-emerald-700" :
          prediction.reaction === "Neutral" ? "bg-sky-100 text-sky-700" : "bg-red-100 text-red-700"
        }`}>
          {prediction.reaction}
        </span>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${getReactionColor(prediction.reaction)} transition-all`}
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground w-10 text-right">
          {prediction.confidence}%
        </span>
      </div>

      {prediction.reasoning && (
        <p className="text-xs text-foreground mb-2 leading-relaxed bg-muted/50 p-2 rounded-lg">
          {prediction.reasoning}
        </p>
      )}

      <ul className="space-y-1.5">
        {prediction.predictedBehaviors.map((behavior, i) => (
          <li key={i} className="text-xs text-muted-foreground flex gap-2 leading-relaxed">
            <span className="text-primary mt-0.5">•</span>
            {behavior}
          </li>
        ))}
      </ul>

      {prediction.whatTheyNeed && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs">
            <span className="font-medium text-foreground">What they need: </span>
            <span className="text-muted-foreground">{prediction.whatTheyNeed}</span>
          </p>
        </div>
      )}
    </div>
  )
}

export function SimulationResults() {
  const { currentSimulation, teamMembers } = useDeltaStore()

  if (!currentSimulation) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 opacity-40" />
          </div>
          <p className="font-medium text-foreground mb-1">No simulation yet</p>
          <p className="text-sm">
            Add team members and describe a decision to see predicted reactions
          </p>
        </div>
      </div>
    )
  }

  const dri = teamMembers.find((m) => m.id === currentSimulation.driId)
  const { overallRiskScore, reactions, driBriefing, suggestedApproach, rolloutStrategy, biggestRisk } =
    currentSimulation

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">
        {/* Overall Risk Score */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                overallRiskScore < 30 ? "bg-emerald-100" :
                overallRiskScore < 60 ? "bg-amber-100" : "bg-red-100"
              }`}>
                <Shield className={`h-4 w-4 ${
                  overallRiskScore < 30 ? "text-emerald-600" :
                  overallRiskScore < 60 ? "text-amber-600" : "text-red-600"
                }`} />
              </div>
              <div>
                <span>Overall Risk Score: </span>
                <span className={`font-bold ${
                  overallRiskScore < 30 ? "text-emerald-600" :
                  overallRiskScore < 60 ? "text-amber-600" : "text-red-600"
                }`}>
                  {overallRiskScore}/100
                </span>
                <span className={`ml-2 text-sm font-normal ${
                  overallRiskScore < 30 ? "text-emerald-600" :
                  overallRiskScore < 60 ? "text-amber-600" : "text-red-600"
                }`}>
                  — {overallRiskScore < 30 ? "Low Risk" : overallRiskScore < 60 ? "Medium Risk" : "High Risk"}
                </span>
              </div>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 ml-12">
              Below 30 = <span className="text-emerald-600">Low</span> · 30-60 = <span className="text-amber-600">Medium</span> · Above 60 = <span className="text-red-600">High</span>
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
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
                  <span className={`text-2xl font-bold ${
                    overallRiskScore < 30 ? "text-emerald-600" :
                    overallRiskScore < 60 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {overallRiskScore}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Based on predicted resistance levels and number of at-risk individuals in this simulation.
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">
                      {reactions.filter((r) => r.reaction === "Supportive").length} Supportive
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span className="text-muted-foreground">
                      {reactions.filter((r) => r.reaction === "Neutral").length} Neutral
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">
                      {reactions.filter((r) => r.reaction === "Resistant").length} Resistant
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biggest Risk - only shown if AI provided it */}
        {biggestRisk && (
          <Card className="border-red-200 bg-red-50/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base text-red-800">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                Key Risk to Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700 leading-relaxed">
                {biggestRisk}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Briefing - shows "Leadership Briefing" or "DRI Briefing" */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-amber-600" />
              </div>
              {dri ? "Implementor Briefing" : "Leadership Briefing"}
              {dri && (
                <Badge variant="secondary" className="ml-auto text-xs font-normal">
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
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">1-3</span>
              </div>
              Recommended Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {suggestedApproach.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground pt-0.5 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Rollout Strategy */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-sky-600" />
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

        {/* Generate Action Plan Button */}
        <ActionPlanModal simulation={currentSimulation} />

        {/* Predicted Reactions */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            Individual Reactions
            <span className="text-muted-foreground font-normal">({reactions.length} people)</span>
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
