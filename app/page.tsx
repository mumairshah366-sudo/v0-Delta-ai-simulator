"use client"

import { Zap, Sparkles } from "lucide-react"
import { TeamSidebar } from "@/components/org-sim/team-sidebar"
import { SimulationForm } from "@/components/org-sim/simulation-form"
import { SimulationResults } from "@/components/org-sim/simulation-results"
import { PastSimulations } from "@/components/org-sim/past-simulations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrgSimPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar - Team Members */}
      <TeamSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground tracking-tight">OrgSim</h1>
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <p className="text-xs text-muted-foreground">
                AI Decision Simulator for Managers
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Decision Form */}
          <div className="w-[420px] flex-shrink-0 border-r border-border p-6 overflow-y-auto bg-background">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  New Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimulationForm />
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="flex-1 min-w-0 overflow-hidden bg-secondary/30">
            <SimulationResults />
          </div>
        </div>

        {/* Past Simulations */}
        <PastSimulations />
      </main>
    </div>
  )
}
