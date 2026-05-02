"use client"

import { create } from "zustand"
import type {
  TeamMember,
  SimulationResult,
  PastSimulation,
  DecisionScope,
} from "./types"

interface OrgSimStore {
  // Team members
  teamMembers: TeamMember[]
  addTeamMember: (member: TeamMember) => void
  removeTeamMember: (id: string) => void
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void

  // Simulation state
  currentSimulation: SimulationResult | null
  setCurrentSimulation: (result: SimulationResult | null) => void
  isSimulating: boolean
  setIsSimulating: (value: boolean) => void

  // Past simulations
  pastSimulations: PastSimulation[]
  addPastSimulation: (simulation: PastSimulation) => void

  // Decision form state
  decisionScope: DecisionScope
  setDecisionScope: (scope: DecisionScope) => void
  selectedDepartment: string | null
  setSelectedDepartment: (dept: string | null) => void
  decisionText: string
  setDecisionText: (text: string) => void
  driId: string | null
  setDriId: (id: string | null) => void

  // Company context (persisted across simulations)
  companyContext: string
  setCompanyContext: (context: string) => void
}

export const useOrgSimStore = create<OrgSimStore>((set) => ({
  // Team members
  teamMembers: [],
  addTeamMember: (member) =>
    set((state) => ({ teamMembers: [...state.teamMembers, member] })),
  removeTeamMember: (id) =>
    set((state) => ({
      teamMembers: state.teamMembers.filter((m) => m.id !== id),
    })),
  updateTeamMember: (id, updates) =>
    set((state) => ({
      teamMembers: state.teamMembers.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  // Simulation state
  currentSimulation: null,
  setCurrentSimulation: (result) => set({ currentSimulation: result }),
  isSimulating: false,
  setIsSimulating: (value) => set({ isSimulating: value }),

  // Past simulations
  pastSimulations: [],
  addPastSimulation: (simulation) =>
    set((state) => ({
      pastSimulations: [simulation, ...state.pastSimulations],
    })),

  // Decision form state
  decisionScope: "Company",
  setDecisionScope: (scope) => set({ decisionScope: scope }),
  selectedDepartment: null,
  setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
  decisionText: "",
  setDecisionText: (text) => set({ decisionText: text }),
  driId: null,
  setDriId: (id) => set({ driId: id }),

  // Company context
  companyContext: "",
  setCompanyContext: (context) => set({ companyContext: context }),
}))

// Helper to get unique departments
export function getUniqueDepartments(members: TeamMember[]): string[] {
  return [...new Set(members.map((m) => m.department))].filter(Boolean)
}

// Helper to calculate years at company
export function calculateYearsAtCompany(joiningDate: Date): number {
  const now = new Date()
  const diff = now.getTime() - joiningDate.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365))
}
