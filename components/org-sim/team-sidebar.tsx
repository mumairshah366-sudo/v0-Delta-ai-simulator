"use client"

import { useState, useMemo } from "react"
import { Plus, Users, Calendar, X, ChevronDown, ChevronUp, ChevronRight, FileText } from "lucide-react"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useDeltaStore, calculateYearsAtCompany } from "@/lib/store"
import type { TeamMember, Seniority, Status, PreviousIndustry } from "@/lib/types"
import { BulkUploadModal } from "./bulk-upload-modal"

const SENIORITY_OPTIONS: Seniority[] = ["Junior", "Mid", "Senior"]
const STATUS_OPTIONS: Status[] = [
  "On PIP",
  "Recently Promoted",
  "No raise 3+ months",
  "High performer",
  "New joiner",
  "At risk of leaving",
]

const PREVIOUS_INDUSTRY_OPTIONS: PreviousIndustry[] = [
  "Tech/Startup",
  "Finance",
  "Banking",
  "Healthcare",
  "Retail",
  "Consulting",
  "Government",
  "Legal",
  "Education",
  "Other",
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

interface DepartmentGroup {
  name: string
  members: TeamMember[]
  managerCount: number
  reporteeCount: number
}

function MemberCard({ member, teamMembers, onRemove }: { 
  member: TeamMember
  teamMembers: TeamMember[]
  onRemove: (id: string) => void 
}) {
  const years = calculateYearsAtCompany(member.joiningDate)
  const manager = member.managerId
    ? teamMembers.find((m) => m.id === member.managerId)
    : null
  const reportees = member.reporteeIds
    .map((id) => teamMembers.find((m) => m.id === id))
    .filter(Boolean)

  return (
    <div className="group relative p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-all">
      <button
        onClick={() => onRemove(member.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
        aria-label={`Remove ${member.name}`}
      >
        <X className="h-3 w-3 text-destructive" />
      </button>
      <div className="pr-6">
        <p className="font-medium text-foreground text-sm">{member.name}</p>
        <p className="text-xs text-muted-foreground">{member.role}</p>
        
        {manager && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
            <ChevronUp className="h-3 w-3 text-primary" />
            <span>Reports to {manager.name}</span>
          </div>
        )}
        
        {reportees.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <ChevronDown className="h-3 w-3 text-accent" />
            <span>{reportees.length} report{reportees.length > 1 ? 's' : ''}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          {member.status && (
            <Badge variant="outline" className={`text-xs py-0 ${getStatusColor(member.status)}`}>
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
}

function DepartmentSection({ group, teamMembers, onRemove, defaultOpen = true }: {
  group: DepartmentGroup
  teamMembers: TeamMember[]
  onRemove: (id: string) => void
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            <span className="font-medium text-sm text-foreground">{group.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-normal">
              {group.members.length} {group.members.length === 1 ? 'person' : 'people'}
            </Badge>
            {group.managerCount > 0 && (
              <Badge variant="outline" className="text-xs font-normal bg-primary/5 border-primary/20 text-primary">
                {group.managerCount} {group.managerCount === 1 ? 'manager' : 'managers'}
              </Badge>
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-4 pt-2 space-y-2">
          {group.members.map((member) => (
            <MemberCard 
              key={member.id} 
              member={member} 
              teamMembers={teamMembers}
              onRemove={onRemove}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function TeamSidebar() {
  const { teamMembers, addTeamMember, removeTeamMember, companyContext, setCompanyContext } = useDeltaStore()
  const [isOpen, setIsOpen] = useState(false)
  const [contextExpanded, setContextExpanded] = useState(false)
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
    age: "" as string,
    previousIndustry: null as PreviousIndustry | null,
  })

  // Group members by department
  const departmentGroups = useMemo(() => {
    const groups: Record<string, DepartmentGroup> = {}
    
    teamMembers.forEach((member) => {
      if (!groups[member.department]) {
        groups[member.department] = {
          name: member.department,
          members: [],
          managerCount: 0,
          reporteeCount: 0,
        }
      }
      groups[member.department].members.push(member)
      
      // Count managers (people with reportees)
      if (member.reporteeIds.length > 0) {
        groups[member.department].managerCount++
      }
      // Count reportees (people with a manager)
      if (member.managerId) {
        groups[member.department].reporteeCount++
      }
    })

    return Object.values(groups).sort((a, b) => b.members.length - a.members.length)
  }, [teamMembers])

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
      age: formData.age ? parseInt(formData.age) : null,
      previousIndustry: formData.previousIndustry,
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
      age: "",
      previousIndustry: null,
    })
  }

  return (
    <aside className="w-80 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">Team</h2>
              <p className="text-xs text-muted-foreground">
                {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
                {departmentGroups.length > 0 && ` · ${departmentGroups.length} ${departmentGroups.length === 1 ? 'dept' : 'depts'}`}
              </p>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (Optional)</Label>
                  <Input
                    id="age"
                    type="number"
                    min={18}
                    max={100}
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    placeholder="e.g. 32"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousIndustry">Previous Industry (Optional)</Label>
                  <Select
                    value={formData.previousIndustry || "none"}
                    onValueChange={(value) =>
                      setFormData({ 
                        ...formData, 
                        previousIndustry: value === "none" ? null : value as PreviousIndustry 
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {PREVIOUS_INDUSTRY_OPTIONS.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

        <BulkUploadModal />

        {/* Company Context - Collapsible */}
        <Collapsible open={contextExpanded} onOpenChange={setContextExpanded} className="mt-4">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium text-foreground">Company Context</span>
                  <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {companyContext && (
                  <span className="text-xs text-primary font-medium">Set</span>
                )}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${contextExpanded ? "rotate-180" : ""}`} />
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="space-y-2">
              <Textarea
                id="company-context"
                value={companyContext}
                onChange={(e) => setCompanyContext(e.target.value)}
                placeholder="Paste key company policies here — WFH rules, bonus criteria, recent announcements, cultural norms..."
                rows={4}
                className="resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground">
                This grounds the simulation in your company&apos;s reality
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {teamMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 opacity-40" />
              </div>
              <p className="text-sm font-medium">No team members yet</p>
              <p className="text-xs mt-1">Add people to start simulating</p>
            </div>
          ) : (
            departmentGroups.map((group, index) => (
              <DepartmentSection
                key={group.name}
                group={group}
                teamMembers={teamMembers}
                onRemove={removeTeamMember}
                defaultOpen={index === 0}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
