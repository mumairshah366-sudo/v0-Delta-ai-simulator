export type Seniority = "Junior" | "Mid" | "Senior"

export type Status =
  | "On PIP"
  | "Recently Promoted"
  | "No raise 3+ months"
  | "High performer"
  | "New joiner"
  | "At risk of leaving"

export type ReactionType = "Supportive" | "Neutral" | "Resistant"

export type DecisionScope = "Company" | "Department" | "Individual"

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
  status: Status
  notes: string
}

export interface PredictedReaction {
  memberId: string
  member: TeamMember
  reaction: ReactionType
  confidence: number
  predictedBehaviors: string[]
  isHighRisk: boolean
}

export interface SimulationResult {
  id: string
  decision: string
  scope: DecisionScope
  department: string | null
  driId: string
  overallRiskScore: number
  reactions: PredictedReaction[]
  driBriefing: string
  suggestedApproach: string[]
  rolloutStrategy: string
  createdAt: Date
}

export interface PastSimulation {
  id: string
  decision: string
  scope: DecisionScope
  riskScore: number
  createdAt: Date
}
