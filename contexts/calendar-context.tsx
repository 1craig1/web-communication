"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  reminder: boolean
  reminderTime?: "5min" | "15min" | "30min" | "1hour" | "1day"
}

interface CalendarContextType {
  events: CalendarEvent[]
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  addEvent: (event: Omit<CalendarEvent, "id">) => void
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

const defaultEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "INFO1111 Lecture",
    description: "Weekly lecture on Information Technology Fundamentals",
    date: "2025-04-02",
    time: "10:00",
    reminder: true,
    reminderTime: "15min",
  },
  {
    id: "2",
    title: "COMP2123 Group Meeting",
    description: "Project planning meeting with team members",
    date: "2025-04-03",
    time: "14:30",
    reminder: true,
    reminderTime: "30min",
  },
  {
    id: "3",
    title: "INFO2222 Assignment Due",
    description: "Submit final project for Web Information Technologies",
    date: "2025-04-05",
    time: "18:00",
    reminder: true,
    reminderTime: "1day",
  },
]

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Initialize from localStorage on first render
  useEffect(() => {
    const storedEvents = localStorage.getItem("calendarEvents")
    const storedSelectedDate = localStorage.getItem("selectedDate")

    if (storedEvents) {
      setEvents(JSON.parse(storedEvents))
    }

    if (storedSelectedDate) {
      setSelectedDate(new Date(storedSelectedDate))
    }

    setInitialized(true)
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!initialized) return

    localStorage.setItem("calendarEvents", JSON.stringify(events))
    if (selectedDate) {
      localStorage.setItem("selectedDate", selectedDate.toISOString())
    }
  }, [initialized, events, selectedDate])

  const addEvent = (event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: uuidv4(),
      description: event.description || "",
      time: event.time || "",
      reminderTime: event.reminderTime || "15min",
    }
    setEvents([...events, newEvent])
  }

  const updateEvent = (id: string, eventUpdates: Partial<CalendarEvent>) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id
          ? {
              ...event,
              ...eventUpdates,
              description: eventUpdates.description ?? event.description,
              time: eventUpdates.time ?? event.time,
              reminderTime: eventUpdates.reminderTime ?? event.reminderTime,
            }
          : event,
      ),
    )
  }

  const deleteEvent = (id: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id))
  }

  return (
    <CalendarContext.Provider
      value={{
        events,
        selectedDate,
        setSelectedDate,
        addEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider")
  }
  return context
}

