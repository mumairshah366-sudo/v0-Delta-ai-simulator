"use client"

import { useState } from "react"
import { ClipboardCheck, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDeltaStore } from "@/lib/store"
import type { 
  PastSimulation, 
  ActualReaction, 
  OutcomeResult,
  MemberOutcome,
  SimulationOutcome 
} from "@/lib/types"
import { updateDeltaMemoryOutcome } from "./delta-memory-panel"

const OUTCOME_RESULTS: OutcomeResult[] = [
  "Better than predicted",
  "As predicted",
  "Worse than predicted",
  "Decision was reversed",
]

const ACTUAL_REACTIONS: ActualReaction[] = [
  "Supportive",
  "Neutral",
  "Resistant",
  "Left company",
]

function getReactionColor(reaction: string): string {
  switch (reaction) {
    case "Supportive":
      return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "Neutral":
      return "bg-slate-100 text-slate-700 border-slate-200"
    case "Resistant":
      return "bg-red-100 text-red-700 border-red-200"
    case "Left company":
      return "bg-purple-100 text-purple-700 border-purple-200"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

interface OutcomeFeedbackModalProps {
  simulation: PastSimulation
}

export function OutcomeFeedbackModal({ simulation }: OutcomeFeedbackModalProps) {
  const { updateSimulationOutcome } = useDeltaStore()
  const [isOpen, setIsOpen] = useState(false)
  const [actualOutcome, setActualOutcome] = useState("")
  const [overallResult, setOverallResult] = useState<OutcomeResult | "">("")
  const [memberOutcomes, setMemberOutcomes] = useState<Record<string, ActualReaction | null>>({})

  const handleSave = async () => {
    if (!overallResult) return

    const outcomes: MemberOutcome[] = simulation.reactions?.map((r) => ({
      memberId: r.memberId,
      name: r.member.name,
      predictedReaction: r.reaction,
      actualReaction: memberOutcomes[r.memberId] || null,
    })) || []

    const outcome: SimulationOutcome = {
      actualOutcome,
      overallResult: overallResult as OutcomeResult,
      memberOutcomes: outcomes,
      recordedAt: new Date(),
    }

    updateSimulationOutcome(simulation.id, outcome)

    // Update Delta Memory for each member with actual reaction
    outcomes.forEach((o) => {
      if (o.actualReaction) {
        updateDeltaMemoryOutcome(o.memberId, o.actualReaction)
      }
    })

    // Send to Mubit for learning
    try {
      await fetch('/api/outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationId: simulation.id,
          decision: simulation.decision,
          actualOutcome,
          overallResult,
          memberOutcomes: outcomes,
        }),
      })
    } catch (error) {
      console.error('Failed to send outcome to learning API:', error)
    }

    setIsOpen(false)
  }

  if (simulation.outcome) {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
        <Check className="h-3 w-3 mr-1" />
        Outcome recorded
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <ClipboardCheck className="h-3 w-3 mr-1" />
          Record Outcome
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Record Outcome</DialogTitle>
          <DialogDescription>
            Record what actually happened to improve future predictions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
          {/* Decision reminder */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Decision:</p>
            <p className="text-sm font-medium text-foreground">{simulation.decision}</p>
          </div>

          {/* What actually happened */}
          <div className="space-y-2">
            <Label htmlFor="outcome">What actually happened?</Label>
            <Textarea
              id="outcome"
              value={actualOutcome}
              onChange={(e) => setActualOutcome(e.target.value)}
              placeholder="Describe the actual outcome and team reactions..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Overall outcome */}
          <div className="space-y-2">
            <Label htmlFor="result">Overall outcome</Label>
            <Select
              value={overallResult}
              onValueChange={(value) => setOverallResult(value as OutcomeResult)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                {OUTCOME_RESULTS.map((result) => (
                  <SelectItem key={result} value={result}>
                    {result}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Individual reactions */}
          {simulation.reactions && simulation.reactions.length > 0 && (
            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <Label>Individual reactions</Label>
              <ScrollArea className="flex-1 border rounded-lg">
                <div className="p-2 space-y-2">
                  {simulation.reactions.map((r) => (
                    <div
                      key={r.memberId}
                      className="flex items-center justify-between p-2 rounded-lg bg-background border border-border"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-sm font-medium text-foreground truncate">
                          {r.member.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs shrink-0 ${getReactionColor(r.reaction)}`}
                        >
                          Predicted: {r.reaction}
                        </Badge>
                      </div>
                      <Select
                        value={memberOutcomes[r.memberId] || ""}
                        onValueChange={(value) =>
                          setMemberOutcomes((prev) => ({
                            ...prev,
                            [r.memberId]: value as ActualReaction,
                          }))
                        }
                      >
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue placeholder="Actual..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTUAL_REACTIONS.map((reaction) => (
                            <SelectItem key={reaction} value={reaction}>
                              {reaction}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleSave}
            disabled={!overallResult}
            className="w-full"
          >
            Save Outcome
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
