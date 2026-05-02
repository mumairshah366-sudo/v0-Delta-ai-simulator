"use client"

import { Zap } from "lucide-react"
import { TeamSidebar } from "@/components/org-sim/team-sidebar"
import { SimulationForm } from "@/components/org-sim/simulation-form"
import { SimulationResults } from "@/components/org-sim/simulation-results"
import { PastSimulations } from "@/components/org-sim/past-simulations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrgSimPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Team Members */}
      <TeamSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-6 py-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">OrgSim</h1>
              <p className="text-xs text-muted-foreground">
                AI Decision Simulator for Managers
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {/* Decision Form */}
          <div className="w-[400px] border-r border-border p-6 overflow-y-auto">
            <Card className="border-border bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">New Simulation</CardTitle>
              </CardHeader>
              <CardContent>
                <SimulationForm />
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="flex-1 min-w-0 bg-secondary/20">
            <SimulationResults />
          </div>
        </div>

        {/* Past Simulations */}
        <PastSimulations />
      </main>
    </div>
  )
}
