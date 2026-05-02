"use client"

import { History, Clock, ChevronRight, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useDeltaStore } from "@/lib/store"
import { OutcomeFeedbackModal } from "./outcome-feedback-modal"

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function getRiskColor(score: number): string {
  if (score < 30) return "bg-emerald-100 text-emerald-700 border-emerald-200"
  if (score < 60) return "bg-amber-100 text-amber-700 border-amber-200"
  return "bg-red-100 text-red-700 border-red-200"
}

export function PastSimulations() {
  const { pastSimulations } = useDeltaStore()

  if (pastSimulations.length === 0) {
    return null
  }

  return (
    <div className="flex-shrink-0 border-t border-border bg-card">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <History className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground">Past Simulations</h3>
            <p className="text-xs text-muted-foreground">{pastSimulations.length} total</p>
          </div>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {pastSimulations.map((sim) => (
              <div
                key={sim.id}
                className="flex-shrink-0 w-72 p-4 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="text-xs bg-muted/50">
                    {sim.scope}
                  </Badge>
                  <Badge variant="outline" className={getRiskColor(sim.riskScore)}>
                    Risk: {sim.riskScore}
                  </Badge>
                </div>
                <p className="text-sm text-foreground line-clamp-2 mb-3 font-medium">
                  {sim.decision}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1.5" />
                    {formatDate(sim.createdAt)}
                  </div>
                  {sim.outcome ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs py-0">
                      <Check className="h-2.5 w-2.5 mr-1" />
                      Recorded
                    </Badge>
                  ) : (
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  )}
                </div>
                <div className="mt-2 pt-2 border-t border-border">
                  <OutcomeFeedbackModal simulation={sim} />
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}
