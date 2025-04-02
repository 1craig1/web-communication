"use client"

import { useState, useEffect } from "react"
import { Bold, Italic, Link, List, ListOrdered, Plus, Save, Trash2, Underline } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDocuments } from "@/contexts/document-context"
import { useTasks } from "@/contexts/task-context"

export default function DocumentsPage() {
  const { documents, activeDocumentId, setActiveDocumentId, addDocument, updateDocument, deleteDocument } =
    useDocuments()

  const { courseUnits } = useTasks()

  const [documentTitle, setDocumentTitle] = useState("")
  const [documentContent, setDocumentContent] = useState("")
  const [selectedCourseUnitId, setSelectedCourseUnitId] = useState<string | undefined>()
  const [isEditing, setIsEditing] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)

  const activeDocument = documents.find((doc) => doc.id === activeDocumentId) || null

  useEffect(() => {
    if (activeDocument) {
      setDocumentContent(activeDocument.content)
      setIsEditing(true)
    }
  }, [activeDocument])

  const handleCreateDocument = () => {
    if (!documentTitle.trim()) return

    const newDocument = addDocument({
      title: documentTitle,
      content: "<p>Start writing here...</p>",
      courseUnitId: selectedCourseUnitId,
    })

    setDocumentTitle("")
    setSelectedCourseUnitId(undefined)
    setActiveDocumentId(newDocument.id)
    setDocumentContent(newDocument.content)
    setIsEditing(true)
  }

  const handleOpenDocument = (documentId: string) => {
    setActiveDocumentId(documentId)
  }

  const handleSaveDocument = () => {
    if (!activeDocumentId) return

    updateDocument(activeDocumentId, {
      content: documentContent,
    })
  }

  const handleDeleteDocument = (documentId: string) => {
    deleteDocument(documentId)
  }

  const formatText = (command: string, value = "") => {
    document.execCommand(command, false, value)
    const selection = document.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const selectedContent = range.extractContents()
      const span = document.createElement("span")
      span.appendChild(selectedContent)
      range.insertNode(span)
      selection.removeAllRanges()
    }

    // Update content after formatting
    const editor = document.querySelector('[contenteditable="true"]')
    if (editor) {
      setDocumentContent(editor.innerHTML)
    }
  }

  const filteredDocuments = filter ? documents.filter((doc) => doc.courseUnitId === filter) : documents

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">Create and edit documents for your courses.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>My Documents</CardTitle>
              <CardDescription>
                {documents.length} document{documents.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={filter || "all"} onValueChange={(value) => setFilter(value === "all" ? null : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    {courseUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-lg cursor-pointer ${
                        activeDocumentId === doc.id ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-muted"
                      }`}
                      onClick={() => handleOpenDocument(doc.id)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{doc.title}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDocument(doc.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                      {doc.courseUnitId && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {courseUnits.find((unit) => unit.id === doc.courseUnitId)?.code || "Unknown Course"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Document</DialogTitle>
                    <DialogDescription>Enter a title for your new document.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        placeholder="Document title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="courseUnit">Course Unit (Optional)</Label>
                      <Select
                        value={selectedCourseUnitId || "none"}
                        onValueChange={(value) => setSelectedCourseUnitId(value === "none" ? undefined : value)}
                      >
                        <SelectTrigger id="courseUnit">
                          <SelectValue placeholder="Select course unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Course Unit</SelectItem>
                          {courseUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.code} - {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateDocument}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>

        <div className="flex-1">
          {isEditing && activeDocument ? (
            <Card className="h-full">
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>{activeDocument.title}</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleSaveDocument}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
                <div className="flex items-center gap-1 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => formatText("bold")} className="h-8 w-8 p-0">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText("italic")} className="h-8 w-8 p-0">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText("underline")} className="h-8 w-8 p-0">
                    <Underline className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = prompt("Enter URL:")
                      if (url) formatText("createLink", url)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("insertUnorderedList")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText("insertOrderedList")}
                    className="h-8 w-8 p-0"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  className="min-h-[500px] p-4 focus:outline-none"
                  contentEditable
                  dangerouslySetInnerHTML={{ __html: documentContent }}
                  onInput={(e) => setDocumentContent(e.currentTarget.innerHTML)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center p-6">
                <h3 className="text-lg font-medium">No document selected</h3>
                <p className="text-muted-foreground mt-2">
                  Select a document from the list or create a new one to start editing.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

