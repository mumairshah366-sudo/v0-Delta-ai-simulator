"use client"

import { Activity } from "lucide-react"
import { TeamSidebar } from "@/components/org-sim/team-sidebar"
import { SimulationForm } from "@/components/org-sim/simulation-form"
import { SimulationResults } from "@/components/org-sim/simulation-results"
import { PastSimulations } from "@/components/org-sim/past-simulations"

export default function OrgSimPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar - Team Members */}
      <TeamSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 px-8 py-5 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-card" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                OrgSim
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered decision simulator
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Decision Form */}
          <div className="w-[400px] flex-shrink-0 border-r border-border overflow-y-auto bg-card/50">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-sm font-medium text-foreground mb-1">New Simulation</h2>
                <p className="text-xs text-muted-foreground">
                  Describe a decision to predict team reactions
                </p>
              </div>
              <SimulationForm />
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex-1 min-w-0 overflow-hidden bg-muted/30">
            <SimulationResults />
          </div>
        </div>

        {/* Past Simulations */}
        <PastSimulations />
      </main>
    </div>
  )
}
