"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import type { TeamMember } from "@/lib/types"

interface SimulationLoadingOverlayProps {
  isLoading: boolean
  teamMembers: TeamMember[]
  onComplete: () => void
  apiReturned: boolean
}

const STAGES = [
  {
    icon: "🧠",
    text: "Loading org memory...",
    subtext: "Retrieving Mubit context for your team",
    startProgress: 0,
    endProgress: 20,
    duration: 1500,
  },
  {
    icon: "📊",
    text: "Cross-referencing 28M Glassdoor reviews...",
    subtext: "Matching role patterns via Bright Data",
    startProgress: 20,
    endProgress: 45,
    duration: 1500,
  },
  {
    icon: "⚖️",
    text: "Applying IBM HR attrition patterns...",
    subtext: "Calculating resistance multipliers",
    startProgress: 45,
    endProgress: 65,
    duration: 1500,
  },
  {
    icon: "🔮",
    text: "Simulating individual reactions...",
    subtext: "Running persona calibration engine",
    startProgress: 65,
    endProgress: 85,
    duration: 1500,
  },
]

const REACTIONS = ["Supportive", "Neutral", "Resistant"]

export function SimulationLoadingOverlay({ 
  isLoading, 
  teamMembers, 
  onComplete,
  apiReturned 
}: SimulationLoadingOverlayProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showingMembers, setShowingMembers] = useState<number[]>([])
  const [memberReactions, setMemberReactions] = useState<Record<number, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [waitingForApi, setWaitingForApi] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setCurrentStage(0)
      setProgress(0)
      setShowingMembers([])
      setMemberReactions({})
      setIsComplete(false)
      setWaitingForApi(false)
      return
    }

    // Progress through stages
    const stageTimers: NodeJS.Timeout[] = []
    let elapsed = 0

    STAGES.forEach((stage, index) => {
      const timer = setTimeout(() => {
        setCurrentStage(index)
        
        // Animate progress within stage
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const target = stage.endProgress
            if (prev >= target) {
              clearInterval(progressInterval)
              return prev
            }
            return Math.min(prev + 1, target)
          })
        }, stage.duration / (stage.endProgress - stage.startProgress))
        
        stageTimers.push(progressInterval as unknown as NodeJS.Timeout)
      }, elapsed)
      
      stageTimers.push(timer)
      elapsed += stage.duration
    })

    return () => {
      stageTimers.forEach(clearTimeout)
    }
  }, [isLoading])

  // Stage 4: Show members appearing with flickering reactions
  useEffect(() => {
    if (currentStage === 3 && isLoading) {
      const memberInterval = setInterval(() => {
        setShowingMembers((prev) => {
          if (prev.length >= Math.min(teamMembers.length, 6)) {
            clearInterval(memberInterval)
            return prev
          }
          return [...prev, prev.length]
        })
      }, 200)

      // Flicker reactions
      const flickerInterval = setInterval(() => {
        setMemberReactions((prev) => {
          const newReactions: Record<number, string> = {}
          showingMembers.forEach((idx) => {
            newReactions[idx] = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]
          })
          return newReactions
        })
      }, 150)

      return () => {
        clearInterval(memberInterval)
        clearInterval(flickerInterval)
      }
    }
  }, [currentStage, isLoading, teamMembers.length, showingMembers])

  // Handle API return and completion
  useEffect(() => {
    if (apiReturned && isLoading) {
      if (currentStage < 3) {
        // API returned before stage 4 - wait for stage 4
        setWaitingForApi(true)
      } else {
        // API returned during or after stage 4 - complete
        setProgress(100)
        setIsComplete(true)
        setTimeout(() => {
          onComplete()
        }, 500)
      }
    }
  }, [apiReturned, isLoading, currentStage, onComplete])

  // Check if we were waiting and now reached stage 4
  useEffect(() => {
    if (waitingForApi && currentStage >= 3) {
      setProgress(100)
      setIsComplete(true)
      setTimeout(() => {
        onComplete()
      }, 500)
    }
  }, [waitingForApi, currentStage, onComplete])

  // If API takes longer than 6s, show "Finalising analysis..."
  useEffect(() => {
    if (isLoading && currentStage === 3 && progress >= 85 && !apiReturned && !isComplete) {
      setProgress(95)
    }
  }, [isLoading, currentStage, progress, apiReturned, isComplete])

  if (!isLoading) return null

  const stage = isComplete 
    ? { icon: "", text: "Calibration complete", subtext: "", startProgress: 100, endProgress: 100, duration: 0 }
    : currentStage >= 3 && progress >= 85 && !apiReturned
      ? { icon: "⏳", text: "Finalising analysis...", subtext: "Processing complex team dynamics", startProgress: 85, endProgress: 95, duration: 0 }
      : STAGES[currentStage]

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .pulse-icon { animation: pulse 1s ease-in-out infinite; }
        .slide-in { animation: slideIn 0.3s ease-out forwards; }
        .flicker { animation: flicker 0.15s ease-in-out infinite; }
      `}</style>
      
      <div className="w-full max-w-md px-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {isComplete ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
          ) : (
            <span className="text-5xl pulse-icon">{stage.icon}</span>
          )}
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-foreground mb-1">{stage.text}</p>
          <p className="text-sm text-muted-foreground">{stage.subtext}</p>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
          <div 
            className="h-full transition-all duration-300 ease-out rounded-full"
            style={{ 
              width: `${progress}%`,
              backgroundColor: '#6c63ff'
            }}
          />
        </div>

        {/* Member previews in stage 4 */}
        {currentStage === 3 && !isComplete && showingMembers.length > 0 && (
          <div className="space-y-2">
            {showingMembers.map((idx) => {
              const member = teamMembers[idx]
              if (!member) return null
              const reaction = memberReactions[idx] || "Neutral"
              return (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 slide-in"
                >
                  <span className="text-sm text-foreground truncate">{member.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full flicker ${
                    reaction === "Supportive" ? "bg-emerald-100 text-emerald-700" :
                    reaction === "Neutral" ? "bg-sky-100 text-sky-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {reaction}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Progress percentage */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {progress}% complete
        </p>
      </div>
    </div>
  )
}
