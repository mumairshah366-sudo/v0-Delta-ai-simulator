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

function getStatusColor(status: Status): string {
  switch (status) {
    case "High performer":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "Recently Promoted":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "New joiner":
      return "bg-sky-500/20 text-sky-400 border-sky-500/30"
    case "On PIP":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "At risk of leaving":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "No raise 3+ months":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    default:
      return "bg-muted text-muted-foreground"
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
    status: "New joiner" as Status,
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
      status: "New joiner",
      notes: "",
    })
  }

  return (
    <aside className="w-80 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Team Members</h2>
          <span className="ml-auto text-sm text-muted-foreground">
            {teamMembers.length}
          </span>
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
                Add a new team member to simulate how they&apos;ll react to organizational decisions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                <div className="flex flex-wrap gap-2 p-2 min-h-[40px] rounded-md border border-input bg-input">
                  {formData.reporteeIds.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No reportees selected</span>
                  ) : (
                    formData.reporteeIds.map((id) => {
                      const member = teamMembers.find((m) => m.id === id)
                      return member ? (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
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

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Status) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
        <div className="p-3 space-y-2">
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No team members yet</p>
              <p className="text-xs">Add people to start simulating</p>
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
                  className="group relative p-3 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <button
                    onClick={() => removeTeamMember(member.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/20 rounded-lg"
                    aria-label={`Remove ${member.name}`}
                  >
                    <X className="h-3 w-3 text-destructive" />
                  </button>
                  <div className="pr-6">
                    <p className="font-medium text-foreground text-sm">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.role} · {member.department}
                    </p>
                    
                    {/* Manager info */}
                    {manager && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                        <ChevronUp className="h-3 w-3 text-primary/60" />
                        <span>Reports to {manager.name}</span>
                      </div>
                    )}
                    
                    {/* Reportees info */}
                    {reportees.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <ChevronDown className="h-3 w-3 text-accent/60" />
                        <span>{reportees.length} direct report{reportees.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={getStatusColor(member.status)}
                      >
                        {member.status}
                      </Badge>
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
