export type Seniority = "Junior" | "Mid" | "Senior"

export type Status =
  | "On PIP"
  | "Recently Promoted"
  | "No raise 3+ months"
  | "High performer"
  | "New joiner"
  | "At risk of leaving"

export type ReactionType = "Supportive" | "Neutral" | "Resistant"

export type ActualReaction = "Supportive" | "Neutral" | "Resistant" | "Left company"

export type DecisionScope = "Company" | "Department" | "Individual"

export type PreviousIndustry = 
  | "Tech/Startup"
  | "Finance"
  | "Banking"
  | "Healthcare"
  | "Retail"
  | "Consulting"
  | "Government"
  | "Legal"
  | "Education"
  | "Other"

export type OutcomeResult = 
  | "Better than predicted"
  | "As predicted"
  | "Worse than predicted"
  | "Decision was reversed"

export interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  seniority: Seniority
  managerId: string | null
  reporteeIds: string[]
  joiningDate: Date
  npsScore: number | null
  status: Status | null
  notes: string
  age: number | null
  previousIndustry: PreviousIndustry | null
}

export interface PredictedReaction {
  memberId: string
  member: TeamMember
  reaction: ReactionType
  confidence: number
  predictedBehaviors: string[]
  isHighRisk: boolean
  reasoning?: string
  whatTheyNeed?: string
}

export interface SimulationResult {
  id: string
  decision: string
  scope: DecisionScope
  department: string | null
  driId: string | null
  overallRiskScore: number
  reactions: PredictedReaction[]
  driBriefing: string
  suggestedApproach: string[]
  rolloutStrategy: string
  biggestRisk?: string
  createdAt: Date
}

export interface MemberOutcome {
  memberId: string
  name: string
  predictedReaction: ReactionType
  actualReaction: ActualReaction | null
}

export interface SimulationOutcome {
  actualOutcome: string
  overallResult: OutcomeResult
  memberOutcomes: MemberOutcome[]
  recordedAt: Date
}

export interface PastSimulation {
  id: string
  decision: string
  scope: DecisionScope
  riskScore: number
  createdAt: Date
  reactions?: PredictedReaction[]
  outcome?: SimulationOutcome
}
