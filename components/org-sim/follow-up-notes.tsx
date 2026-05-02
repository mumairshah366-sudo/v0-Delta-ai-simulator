"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Plus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface Note {
  id: string
  text: string
  createdAt: string
}

function getStoredNotes(simulationId: string): Note[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(`delta-notes-${simulationId}`)
  return stored ? JSON.parse(stored) : []
}

function saveNotes(simulationId: string, notes: Note[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(`delta-notes-${simulationId}`, JSON.stringify(notes))
}

export function getNotesCount(simulationId: string): number {
  return getStoredNotes(simulationId).length
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function FollowUpNotes({ simulationId, hasOutcome }: { simulationId: string; hasOutcome: boolean }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setNotes(getStoredNotes(simulationId))
  }, [simulationId])

  const handleAddNote = () => {
    if (!newNote.trim() || newNote.length > 500) return
    
    const note: Note = {
      id: crypto.randomUUID(),
      text: newNote.trim(),
      createdAt: new Date().toISOString(),
    }
    
    const updatedNotes = [...notes, note]
    setNotes(updatedNotes)
    saveNotes(simulationId, updatedNotes)
    setNewNote("")
  }

  if (!hasOutcome) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3 pt-3 border-t border-border">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Follow-up Notes</span>
          </div>
          {notes.length > 0 && (
            <Badge variant="secondary" className="text-xs py-0">
              {notes.length}
            </Badge>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 space-y-3">
          {notes.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No notes yet. Add updates as the decision rolls out.
            </p>
          ) : (
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className="text-xs">
                    <span className="text-muted-foreground">[{formatDateTime(note.createdAt)}]</span>
                    <span className="text-foreground ml-1">— {note.text}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex gap-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value.slice(0, 500))}
              placeholder="Add a follow-up note..."
              rows={2}
              className="text-xs resize-none"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="flex-shrink-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {newNote.length}/500
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
