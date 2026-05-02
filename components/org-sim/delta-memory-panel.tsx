"use client"

import { useState, useEffect } from "react"
import { Brain, ChevronDown, ChevronRight, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface DeltaMemory {
  simulationCount: number
  lastDecision: string
  lastDate: string
  predictedReactions: string[]
  actualReactions: string[]
  pattern: "Consistently Resistant" | "Usually Supportive" | "Mixed"
}

function getPatternColor(pattern: DeltaMemory["pattern"]) {
  switch (pattern) {
    case "Consistently Resistant": return "bg-red-100 text-red-700 border-red-200"
    case "Usually Supportive": return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "Mixed": return "bg-amber-100 text-amber-700 border-amber-200"
  }
}

export function getDeltaMemory(personId: string): DeltaMemory | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(`delta-memory-${personId}`)
  return stored ? JSON.parse(stored) : null
}

export function updateDeltaMemory(
  personId: string,
  personName: string,
  decision: string,
  predictedReaction: string,
  actualReaction?: string
) {
  if (typeof window === "undefined") return

  const existing = getDeltaMemory(personId)
  
  const predictedReactions = existing?.predictedReactions || []
  const actualReactions = existing?.actualReactions || []
  
  predictedReactions.push(predictedReaction)
  if (actualReaction) {
    actualReactions.push(actualReaction)
  }

  // Calculate pattern based on predicted reactions
  const resistantCount = predictedReactions.filter(r => r === "Resistant").length
  const supportiveCount = predictedReactions.filter(r => r === "Supportive").length
  const total = predictedReactions.length

  let pattern: DeltaMemory["pattern"] = "Mixed"
  if (resistantCount / total >= 0.6) {
    pattern = "Consistently Resistant"
  } else if (supportiveCount / total >= 0.6) {
    pattern = "Usually Supportive"
  }

  const memory: DeltaMemory = {
    simulationCount: (existing?.simulationCount || 0) + 1,
    lastDecision: decision,
    lastDate: new Date().toISOString(),
    predictedReactions,
    actualReactions,
    pattern,
  }

  localStorage.setItem(`delta-memory-${personId}`, JSON.stringify(memory))
}

export function updateDeltaMemoryOutcome(personId: string, actualReaction: string) {
  if (typeof window === "undefined") return

  const existing = getDeltaMemory(personId)
  if (!existing) return

  const actualReactions = [...existing.actualReactions, actualReaction]
  
  localStorage.setItem(`delta-memory-${personId}`, JSON.stringify({
    ...existing,
    actualReactions,
  }))
}

export function DeltaMemoryPanel({ personId }: { personId: string }) {
  const [memory, setMemory] = useState<DeltaMemory | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const stored = getDeltaMemory(personId)
    setMemory(stored)

    // Listen for storage changes
    const handleStorage = () => {
      setMemory(getDeltaMemory(personId))
    }
    window.addEventListener("storage", handleStorage)
    
    // Also poll for changes (since storage event doesn't fire in same tab)
    const interval = setInterval(() => {
      setMemory(getDeltaMemory(personId))
    }, 2000)

    return () => {
      window.removeEventListener("storage", handleStorage)
      clearInterval(interval)
    }
  }, [personId])

  if (!memory || memory.simulationCount === 0) {
    return null
  }

  // Calculate accuracy
  const matchingReactions = memory.actualReactions.filter(
    (actual, i) => actual === memory.predictedReactions[i]
  ).length
  const accuracy = memory.actualReactions.length > 0
    ? Math.round((matchingReactions / memory.actualReactions.length) * 100)
    : null

  const lastDate = new Date(memory.lastDate)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(lastDate)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
          <div className="flex items-center gap-2">
            <Brain className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">Delta has memory</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs py-0">
              {memory.simulationCount} sim{memory.simulationCount > 1 ? 's' : ''}
            </Badge>
            {isOpen ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-2 pt-3 space-y-2">
          <Badge variant="outline" className={`text-xs ${getPatternColor(memory.pattern)}`}>
            {memory.pattern}
          </Badge>
          
          <p className="text-xs text-muted-foreground">
            Last seen in: <span className="font-medium text-foreground">{memory.lastDecision.slice(0, 30)}...</span>
            <span className="text-muted-foreground/70"> · {formattedDate}</span>
          </p>

          {accuracy !== null && (
            <div className="flex items-center gap-1.5 text-xs">
              <Target className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">
                Accuracy: <span className="font-medium text-foreground">{accuracy}%</span>
              </span>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
