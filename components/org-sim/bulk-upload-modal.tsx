"use client"

import { useState, useCallback, useRef } from "react"
import * as XLSX from "xlsx"
import { Upload, FileSpreadsheet, ClipboardPaste, Download, X, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useDeltaStore } from "@/lib/store"
import type { TeamMember, Seniority, Status, PreviousIndustry } from "@/lib/types"

interface ParsedMember {
  id: string
  name: string
  role: string
  department: string
  seniority: Seniority
  status: Status | null
  npsScore: number | null
  notes: string
  joiningDate: Date
  age: number | null
  previousIndustry: PreviousIndustry | null
  isValid: boolean
  errors: string[]
}

const VALID_SENIORITIES: Seniority[] = ["Junior", "Mid", "Senior"]
const VALID_STATUSES: Status[] = [
  "On PIP",
  "Recently Promoted",
  "No raise 3+ months",
  "High performer",
  "New joiner",
  "At risk of leaving",
]
const VALID_INDUSTRIES: PreviousIndustry[] = [
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

function parseRow(row: Record<string, unknown>): ParsedMember {
  const errors: string[] = []
  
  const name = String(row["Name"] || row["name"] || "").trim()
  const role = String(row["Role"] || row["role"] || "").trim()
  const department = String(row["Department"] || row["department"] || "").trim()
  const seniorityRaw = String(row["Seniority"] || row["seniority"] || "Mid").trim()
  const statusRaw = String(row["Status"] || row["status"] || "").trim()
  const npsRaw = row["NPS Score"] || row["nps_score"] || row["NPS"] || row["nps"] || ""
  const notes = String(row["Notes"] || row["notes"] || "").trim()
  const joiningDateRaw = row["Joining Date"] || row["joining_date"] || row["JoiningDate"] || ""
  const ageRaw = row["Age"] || row["age"] || ""
  const industryRaw = String(row["Previous Industry"] || row["previous_industry"] || row["PreviousIndustry"] || "").trim()

  if (!name) errors.push("Name is required")
  if (!role) errors.push("Role is required")
  if (!department) errors.push("Department is required")

  // Parse seniority
  let seniority: Seniority = "Mid"
  const seniorityMatch = VALID_SENIORITIES.find(
    s => s.toLowerCase() === seniorityRaw.toLowerCase()
  )
  if (seniorityMatch) {
    seniority = seniorityMatch
  }

  // Parse status
  let status: Status | null = null
  if (statusRaw) {
    const statusMatch = VALID_STATUSES.find(
      s => s.toLowerCase() === statusRaw.toLowerCase()
    )
    if (statusMatch) {
      status = statusMatch
    }
  }

  // Parse NPS score
  let npsScore: number | null = null
  if (npsRaw !== "" && npsRaw !== null && npsRaw !== undefined) {
    const parsed = parseInt(String(npsRaw), 10)
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
      npsScore = parsed
    }
  }

  // Parse joining date
  let joiningDate = new Date()
  if (joiningDateRaw) {
    const parsed = new Date(joiningDateRaw as string | number)
    if (!isNaN(parsed.getTime())) {
      joiningDate = parsed
    }
  }

  // Parse age
  let age: number | null = null
  if (ageRaw !== "" && ageRaw !== null && ageRaw !== undefined) {
    const parsed = parseInt(String(ageRaw), 10)
    if (!isNaN(parsed) && parsed >= 18 && parsed <= 100) {
      age = parsed
    }
  }

  // Parse previous industry
  let previousIndustry: PreviousIndustry | null = null
  if (industryRaw) {
    const industryMatch = VALID_INDUSTRIES.find(
      ind => ind.toLowerCase() === industryRaw.toLowerCase()
    )
    if (industryMatch) {
      previousIndustry = industryMatch
    }
  }

  return {
    id: crypto.randomUUID(),
    name,
    role,
    department,
    seniority,
    status,
    npsScore,
    notes,
    joiningDate,
    age,
    previousIndustry,
    isValid: errors.length === 0,
    errors,
  }
}

function parseCSV(text: string): ParsedMember[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""))
  const members: ParsedMember[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Handle quoted CSV values
    const values: string[] = []
    let current = ""
    let inQuotes = false
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header] = values[idx] || ""
    })

    members.push(parseRow(row))
  }

  return members
}

function generateTemplate(): void {
  const headers = ["Name", "Role", "Department", "Seniority", "Status", "NPS Score", "Notes", "Joining Date", "Age", "Previous Industry"]
  const exampleRows = [
    ["John Smith", "Software Engineer", "Engineering", "Mid", "High performer", "8", "Great team player", "2022-03-15", "32", "Tech/Startup"],
    ["Jane Doe", "Marketing Manager", "Marketing", "Senior", "Recently Promoted", "9", "Just promoted to lead", "2021-07-01", "38", "Consulting"],
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleRows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Team Members")
  
  // Set column widths
  ws["!cols"] = [
    { wch: 20 }, // Name
    { wch: 25 }, // Role
    { wch: 15 }, // Department
    { wch: 12 }, // Seniority
    { wch: 18 }, // Status
    { wch: 10 }, // NPS Score
    { wch: 30 }, // Notes
    { wch: 15 }, // Joining Date
    { wch: 8 },  // Age
    { wch: 18 }, // Previous Industry
  ]

  XLSX.writeFile(wb, "team-members-template.xlsx")
}

export function BulkUploadModal() {
  const { addTeamMember } = useDeltaStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload")
  const [csvText, setCsvText] = useState("")
  const [parsedMembers, setParsedMembers] = useState<ParsedMember[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setCsvText("")
    setParsedMembers([])
    setFileName(null)
    setActiveTab("upload")
  }

  const handleFileUpload = useCallback(async (file: File) => {
    setFileName(file.name)
    
    const reader = new FileReader()
    
    if (file.name.endsWith(".csv")) {
      reader.onload = (e) => {
        const text = e.target?.result as string
        const members = parseCSV(text)
        setParsedMembers(members)
      }
      reader.readAsText(file)
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        const members = jsonData.map((row) => parseRow(row as Record<string, unknown>))
        setParsedMembers(members)
      }
      reader.readAsArrayBuffer(file)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleParseCsv = () => {
    const members = parseCSV(csvText)
    setParsedMembers(members)
  }

  const handleRemoveMember = (id: string) => {
    setParsedMembers(prev => prev.filter(m => m.id !== id))
  }

  const handleImportAll = () => {
    const validMembers = parsedMembers.filter(m => m.isValid)
    validMembers.forEach(member => {
      const newMember: TeamMember = {
        id: member.id,
        name: member.name,
        role: member.role,
        department: member.department,
        seniority: member.seniority,
        managerId: null,
        reporteeIds: [],
        joiningDate: member.joiningDate,
        npsScore: member.npsScore,
        status: member.status,
        notes: member.notes,
        age: member.age,
        previousIndustry: member.previousIndustry,
      }
      addTeamMember(newMember)
    })
    setIsOpen(false)
    resetState()
  }

  const validCount = parsedMembers.filter(m => m.isValid).length
  const invalidCount = parsedMembers.filter(m => !m.isValid).length

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetState()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Upload Team Members</DialogTitle>
          <DialogDescription>
            Import multiple team members at once via file upload or CSV paste.
          </DialogDescription>
        </DialogHeader>

        {parsedMembers.length === 0 ? (
          <div className="space-y-4">
            {/* Download Template Button */}
            <Button
              variant="outline"
              onClick={generateTemplate}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template (.xlsx)
            </Button>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "paste")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="paste" className="flex items-center gap-2">
                  <ClipboardPaste className="h-4 w-4" />
                  Paste Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                  />
                  
                  {fileName ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="h-10 w-10 mx-auto text-primary" />
                      <p className="font-medium text-foreground">{fileName}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFileName(null)
                          setParsedMembers([])
                        }}
                      >
                        Choose Different File
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-foreground font-medium mb-1">
                        Drag and drop your file here
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Supports .csv and .xlsx files
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse Files
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="paste" className="mt-4 space-y-3">
                <Textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`Paste CSV data here. Example:\n\nName,Role,Department,Seniority,Status,NPS Score,Notes,Joining Date\nJohn Smith,Software Engineer,Engineering,Mid,High performer,8,"Great team player",2022-03-15`}
                  rows={8}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleParseCsv}
                  disabled={!csvText.trim()}
                  className="w-full"
                >
                  Parse CSV
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {/* Preview Header */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {validCount} {validCount === 1 ? "employee" : "employees"} ready to import
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive">
                    {invalidCount} with errors
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetState}
              >
                Start Over
              </Button>
            </div>

            {/* Preview Table - scrollable area with fixed height */}
            <div className="flex-1 overflow-auto mt-3 min-h-0">
              <div className="space-y-2 pr-2">
                {parsedMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      member.isValid
                        ? "border-border bg-card"
                        : "border-destructive/50 bg-destructive/5"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {member.isValid ? (
                          <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm text-foreground truncate">
                          {member.name || "(No name)"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {member.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 ml-6">
                        <Badge variant="outline" className="text-xs">
                          {member.department}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {member.seniority}
                        </Badge>
                        {member.status && (
                          <Badge variant="outline" className="text-xs">
                            {member.status}
                          </Badge>
                        )}
                      </div>
                      {!member.isValid && (
                        <p className="text-xs text-destructive mt-1 ml-6">
                          {member.errors.join(", ")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="flex-shrink-0 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Import Button - always visible at bottom */}
            <div className="pt-4 border-t border-border mt-3">
              <Button
                onClick={handleImportAll}
                disabled={validCount === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Import {validCount} {validCount === 1 ? "Employee" : "Employees"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
