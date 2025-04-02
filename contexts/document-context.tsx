"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"

export interface Document {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  courseUnitId?: string
}

interface DocumentContextType {
  documents: Document[]
  activeDocumentId: string | null
  setActiveDocumentId: (id: string | null) => void
  addDocument: (document: Omit<Document, "id" | "createdAt" | "updatedAt">) => void
  updateDocument: (id: string, document: Partial<Document>) => void
  deleteDocument: (id: string) => void
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

const defaultDocuments: Document[] = [
  {
    id: "1",
    title: "INFO1111 Research Paper",
    content:
      "<h1>Cloud Computing Research Paper</h1><p>This is a draft of my research paper on cloud computing technologies.</p><h2>Introduction</h2><p>Cloud computing has revolutionized the way businesses operate in the digital age...</p>",
    createdAt: "2025-03-28T10:30:00Z",
    updatedAt: "2025-03-30T14:15:00Z",
    courseUnitId: "info1111",
  },
  {
    id: "2",
    title: "COMP2123 Meeting Notes",
    content:
      "<h1>Algorithm Project Meeting Notes</h1><p>Date: April 1, 2025</p><h2>Agenda</h2><ol><li>Project requirements review</li><li>Task allocation</li><li>Timeline planning</li></ol><h2>Action Items</h2><ul><li>John: Research sorting algorithms</li><li>Sarah: Prepare test cases</li><li>Mike: Set up GitHub repository</li></ul>",
    createdAt: "2025-04-01T09:00:00Z",
    updatedAt: "2025-04-01T10:15:00Z",
    courseUnitId: "comp2123",
  },
]

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [documents, setDocuments] = useState<Document[]>(defaultDocuments)
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)

  // Initialize from localStorage on first render
  useEffect(() => {
    const storedDocuments = localStorage.getItem("documents")
    const storedActiveDocumentId = localStorage.getItem("activeDocumentId")

    if (storedDocuments) {
      setDocuments(JSON.parse(storedDocuments))
    }

    if (storedActiveDocumentId) {
      setActiveDocumentId(storedActiveDocumentId)
    }

    setInitialized(true)
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!initialized) return

    localStorage.setItem("documents", JSON.stringify(documents))
    if (activeDocumentId) {
      localStorage.setItem("activeDocumentId", activeDocumentId)
    }
  }, [initialized, documents, activeDocumentId])

  const addDocument = (document: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString()
    const newDocument: Document = {
      ...document,
      id: uuidv4(),
      content: document.content || "<p>Start writing here...</p>",
      courseUnitId: document.courseUnitId || undefined,
      createdAt: now,
      updatedAt: now,
    }
    setDocuments([...documents, newDocument])
    return newDocument
  }

  const updateDocument = (id: string, documentUpdates: Partial<Document>) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              ...documentUpdates,
              content: documentUpdates.content ?? doc.content,
              courseUnitId: documentUpdates.courseUnitId ?? doc.courseUnitId,
              updatedAt: new Date().toISOString(),
            }
          : doc,
      ),
    )
  }

  const deleteDocument = (id: string) => {
    setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== id))
    if (activeDocumentId === id) {
      setActiveDocumentId(null)
    }
  }

  return (
    <DocumentContext.Provider
      value={{
        documents,
        activeDocumentId,
        setActiveDocumentId,
        addDocument,
        updateDocument,
        deleteDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentContext)
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider")
  }
  return context
}

