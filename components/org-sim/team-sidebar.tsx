"use client"

import { useState } from "react"
import { Plus, Users, Calendar, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useOrgSimStore, calculateYearsAtCompany } from "@/lib/store"
import type { TeamMember, Seniority, Status } from "@/lib/types"

const SENIORITY_OPTIONS: Seniority[] = ["Junior", "Mid", "Senior"]
const STATUS_OPTIONS: Status[] = [
  "On PIP",
  "Recently Promoted",
  "No raise 3+ months",
  "High performer",
  "New joiner",
  "At risk of leaving",
]

function getStatusColor(status: Status | null): string {
  if (!status) return "bg-secondary text-secondary-foreground border-border"
  switch (status) {
    case "High performer":
      return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "Recently Promoted":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "New joiner":
      return "bg-sky-100 text-sky-700 border-sky-200"
    case "On PIP":
      return "bg-red-100 text-red-700 border-red-200"
    case "At risk of leaving":
      return "bg-orange-100 text-orange-700 border-orange-200"
    case "No raise 3+ months":
      return "bg-amber-100 text-amber-700 border-amber-200"
    default:
      return "bg-secondary text-secondary-foreground border-border"
  }
}

export function TeamSidebar() {
  const { teamMembers, addTeamMember, removeTeamMember } = useOrgSimStore()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    department: "",
    seniority: "Mid" as Seniority,
    managerId: "" as string | null,
    reporteeIds: [] as string[],
    joiningDate: new Date().toISOString().split("T")[0],
    npsScore: "" as string,
    status: null as Status | null,
    notes: "",
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.role || !formData.department) return

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name: formData.name,
      role: formData.role,
      department: formData.department,
      seniority: formData.seniority,
      managerId: formData.managerId || null,
      reporteeIds: formData.reporteeIds,
      joiningDate: new Date(formData.joiningDate),
      npsScore: formData.npsScore ? parseInt(formData.npsScore) : null,
      status: formData.status,
      notes: formData.notes,
    }

    addTeamMember(newMember)
    setIsOpen(false)
    setFormData({
      name: "",
      role: "",
      department: "",
      seniority: "Mid",
      managerId: null,
      reporteeIds: [],
      joiningDate: new Date().toISOString().split("T")[0],
      npsScore: "",
      status: null,
      notes: "",
    })
  }

  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">Team</h2>
              <p className="text-xs text-muted-foreground">{teamMembers.length} members</p>
            </div>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a new team member to simulate how they&apos;ll react to decisions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    placeholder="Engineering"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seniority">Seniority</Label>
                  <Select
                    value={formData.seniority}
                    onValueChange={(value: Seniority) =>
                      setFormData({ ...formData, seniority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SENIORITY_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Reporting Manager</Label>
                <Select
                  value={formData.managerId || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      managerId: value === "none" ? null : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No manager</SelectItem>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportees">Direct Reportees</Label>
                <div className="flex flex-wrap gap-2 p-3 min-h-[44px] rounded-lg border border-input bg-muted/50">
                  {formData.reporteeIds.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No reportees selected</span>
                  ) : (
                    formData.reporteeIds.map((id) => {
                      const member = teamMembers.find((m) => m.id === id)
                      return member ? (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="flex items-center gap-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              reporteeIds: formData.reporteeIds.filter((r) => r !== id),
                            })
                          }
                        >
                          {member.name}
                          <X className="h-3 w-3" />
                        </Badge>
                      ) : null
                    })
                  )}
                </div>
                {teamMembers.filter((m) => !formData.reporteeIds.includes(m.id)).length > 0 && (
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.reporteeIds.includes(value)) {
                        setFormData({
                          ...formData,
                          reporteeIds: [...formData.reporteeIds, value],
                        })
                      }
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Add a reportee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers
                        .filter((m) => !formData.reporteeIds.includes(m.id))
                        .map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) =>
                      setFormData({ ...formData, joiningDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="npsScore">NPS Score (0-10)</Label>
                  <Input
                    id="npsScore"
                    type="number"
                    min={0}
                    max={10}
                    value={formData.npsScore}
                    onChange={(e) =>
                      setFormData({ ...formData, npsScore: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status (Optional)</Label>
                <Select
                  value={formData.status || "none"}
                  onValueChange={(value) =>
                    setFormData({ 
                      ...formData, 
                      status: value === "none" ? null : value as Status 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No status</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="e.g., just had a baby, unhappy with manager"
                  rows={3}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Add Team Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {teamMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 opacity-40" />
              </div>
              <p className="text-sm font-medium">No team members yet</p>
              <p className="text-xs mt-1">Add people to start simulating</p>
            </div>
          ) : (
            teamMembers.map((member) => {
              const years = calculateYearsAtCompany(member.joiningDate)
              const manager = member.managerId
                ? teamMembers.find((m) => m.id === member.managerId)
                : null
              const reportees = member.reporteeIds
                .map((id) => teamMembers.find((m) => m.id === id))
                .filter(Boolean)
              
              return (
                <div
                  key={member.id}
                  className="group relative p-4 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <button
                    onClick={() => removeTeamMember(member.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded-lg"
                    aria-label={`Remove ${member.name}`}
                  >
                    <X className="h-3.5 w-3.5 text-destructive" />
                  </button>
                  <div className="pr-8">
                    <p className="font-medium text-foreground text-sm">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {member.role} · {member.department}
                    </p>
                    
                    {/* Manager info */}
                    {manager && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <ChevronUp className="h-3 w-3 text-primary" />
                        <span>Reports to {manager.name}</span>
                      </div>
                    )}
                    
                    {/* Reportees info */}
                    {reportees.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <ChevronDown className="h-3 w-3 text-accent" />
                        <span>{reportees.length} direct report{reportees.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-3">
                      {member.status && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(member.status)}`}
                        >
                          {member.status}
                        </Badge>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {years}y
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
