"use client"

import { History, Clock, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useOrgSimStore } from "@/lib/store"

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function getRiskColor(score: number): string {
  if (score < 30) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  if (score < 60) return "bg-amber-500/20 text-amber-400 border-amber-500/30"
  return "bg-red-500/20 text-red-400 border-red-500/30"
}

export function PastSimulations() {
  const { pastSimulations } = useOrgSimStore()

  if (pastSimulations.length === 0) {
    return null
  }

  return (
    <div className="border-t border-border bg-card/50">
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Past Simulations</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {pastSimulations.length} total
          </span>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {pastSimulations.map((sim) => (
              <div
                key={sim.id}
                className="flex-shrink-0 w-64 p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {sim.scope}
                  </Badge>
                  <Badge variant="outline" className={getRiskColor(sim.riskScore)}>
                    Risk: {sim.riskScore}
                  </Badge>
                </div>
                <p className="text-sm text-foreground line-clamp-2 mb-2">
                  {sim.decision}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(sim.createdAt)}
                  <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
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
