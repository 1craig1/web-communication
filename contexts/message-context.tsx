"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface Contact {
  id: string
  name: string
  avatar?: string
  status: "online" | "offline" | "away"
  lastMessage?: string
  lastMessageTime?: string
}

export interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  isMe: boolean
}

interface MessagesContextType {
  contacts: Contact[]
  messages: Record<string, Message[]>
  activeContactId: string | null
  setActiveContactId: (id: string | null) => void
  addMessage: (contactId: string, message: Omit<Message, "id">) => void
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

const defaultContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    status: "online",
    lastMessage: "Can we discuss the project timeline?",
    lastMessageTime: "10:30 AM",
  },
  {
    id: "2",
    name: "Mike Peters",
    status: "online",
    lastMessage: "I've shared the document with you",
    lastMessageTime: "Yesterday",
  },
  {
    id: "3",
    name: "Emma Wilson",
    status: "away",
    lastMessage: "Thanks for your help!",
    lastMessageTime: "Yesterday",
  },
  {
    id: "4",
    name: "Alex Thompson",
    status: "offline",
    lastMessage: "Let's catch up next week",
    lastMessageTime: "Mar 28",
  },
]

const defaultMessages: Record<string, Message[]> = {
  "1": [
    { id: "m1", senderId: "1", text: "Hi there! How's the project coming along?", timestamp: "10:15 AM", isMe: false },
    {
      id: "m2",
      senderId: "me",
      text: "It's going well. I've completed the initial designs.",
      timestamp: "10:20 AM",
      isMe: true,
    },
    {
      id: "m3",
      senderId: "1",
      text: "Great! Can we discuss the project timeline?",
      timestamp: "10:30 AM",
      isMe: false,
    },
  ],
  "2": [
    {
      id: "m4",
      senderId: "2",
      text: "Hello! I've been working on the documentation.",
      timestamp: "Yesterday",
      isMe: false,
    },
    { id: "m5", senderId: "me", text: "That's helpful. Can you share it with me?", timestamp: "Yesterday", isMe: true },
    { id: "m6", senderId: "2", text: "I've shared the document with you", timestamp: "Yesterday", isMe: false },
  ],
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>(defaultContacts)
  const [messages, setMessages] = useState<Record<string, Message[]>>(defaultMessages)
  const [activeContactId, setActiveContactId] = useState<string | null>(null)

  // Initialize from localStorage on first render
  useEffect(() => {
    const storedContacts = localStorage.getItem("contacts")
    const storedMessages = localStorage.getItem("messages")
    const storedActiveContactId = localStorage.getItem("activeContactId")

    if (storedContacts) {
      setContacts(JSON.parse(storedContacts))
    }

    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    }

    if (storedActiveContactId) {
      setActiveContactId(storedActiveContactId)
    }

    setInitialized(true)
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!initialized) return

    localStorage.setItem("contacts", JSON.stringify(contacts))
    localStorage.setItem("messages", JSON.stringify(messages))
    if (activeContactId) {
      localStorage.setItem("activeContactId", activeContactId)
    }
  }, [initialized, contacts, messages, activeContactId])

  const addMessage = (contactId: string, message: Omit<Message, "id">) => {
    const newMessage: Message = {
      ...message,
      id: `m${Date.now()}`,
    }

    setMessages((prevMessages) => {
      const contactMessages = prevMessages[contactId] || []
      return {
        ...prevMessages,
        [contactId]: [...contactMessages, newMessage],
      }
    })

    // Update last message in contacts
    setContacts((prevContacts) =>
      prevContacts.map((contact) => {
        if (contact.id === contactId) {
          return {
            ...contact,
            lastMessage: message.text,
            lastMessageTime: "Just now",
          }
        }
        return contact
      }),
    )
  }

  return (
    <MessagesContext.Provider
      value={{
        contacts,
        messages,
        activeContactId,
        setActiveContactId,
        addMessage,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessagesContext)
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessagesProvider")
  }
  return context
}

