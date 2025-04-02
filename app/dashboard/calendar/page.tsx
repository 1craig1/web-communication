"use client"

import { useState } from "react"
import {
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { Bell, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCalendar, type CalendarEvent } from "@/contexts/calendar-context"

export default function CalendarPage() {
  const { events, selectedDate, setSelectedDate, addEvent, updateEvent, deleteEvent } = useCalendar()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, "id">>({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    reminder: false,
  })

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return

    addEvent(newEvent)
    setNewEvent({
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "",
      reminder: false,
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setNewEvent({
      ...newEvent,
      date: format(date, "yyyy-MM-dd"),
    })
  }

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const dateFormat = "d"
    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""

    // Add day names row
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const daysRow = dayNames.map((dayName) => (
      <div key={dayName} className="text-center font-medium text-sm py-2">
        {dayName}
      </div>
    ))
    rows.push(
      <div key="day-names" className="grid grid-cols-7 gap-1">
        {daysRow}
      </div>,
    )

    // Add date cells
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat)
        const cloneDay = day
        const eventsForDay = events.filter((event) => isSameDay(new Date(event.date), cloneDay))

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[80px] p-1 border rounded-md ${
              !isSameMonth(day, monthStart)
                ? "text-muted-foreground bg-muted/30"
                : isSameDay(day, new Date())
                  ? "bg-blue-50 border-blue-200"
                  : ""
            } ${
              selectedDate && isSameDay(day, selectedDate) ? "border-blue-500" : ""
            } hover:bg-muted/50 cursor-pointer`}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className="text-right text-sm p-1">{formattedDate}</div>
            <div className="mt-1 space-y-1">
              {eventsForDay.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                  title={event.title}
                >
                  {event.time && `${event.time} · `}
                  {event.title}
                </div>
              ))}
              {eventsForDay.length > 2 && (
                <div className="text-xs text-muted-foreground p-1">+{eventsForDay.length - 2} more</div>
              )}
            </div>
          </div>,
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>,
      )
      days = []
    }

    return rows
  }

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return []
    return events.filter((event) => isSameDay(new Date(event.date), selectedDate))
  }

  const selectedDateEvents = getEventsForSelectedDate()

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">Manage your schedule and set reminders.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">{renderCalendarDays()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-80">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Events"}</CardTitle>
              <CardDescription>
                {selectedDate
                  ? `${selectedDateEvents.length} event${selectedDateEvents.length !== 1 ? "s" : ""}`
                  : "Select a date to view events"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-4">
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No events for this date</p>
                  ) : (
                    selectedDateEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            {event.time && <p className="text-sm text-muted-foreground mt-1">Time: {event.time}</p>}
                            {event.description && <p className="text-sm mt-2">{event.description}</p>}
                          </div>
                          {event.reminder && (
                            <div className="text-yellow-500">
                              <Bell className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Select a date to view events</p>
              )}
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>Create a new event for your calendar.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Event title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Event description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newEvent.time || ""}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="reminder"
                        type="checkbox"
                        className="w-4 h-4"
                        checked={newEvent.reminder}
                        onChange={(e) => setNewEvent({ ...newEvent, reminder: e.target.checked })}
                      />
                      <Label htmlFor="reminder">Set reminder</Label>
                    </div>
                    {newEvent.reminder && (
                      <div className="grid gap-2">
                        <Label htmlFor="reminderTime">Remind me</Label>
                        <Select
                          value={newEvent.reminderTime || "15min"}
                          onValueChange={(value: "5min" | "15min" | "30min" | "1hour" | "1day") =>
                            setNewEvent({ ...newEvent, reminderTime: value })
                          }
                        >
                          <SelectTrigger id="reminderTime">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5min">5 minutes before</SelectItem>
                            <SelectItem value="15min">15 minutes before</SelectItem>
                            <SelectItem value="30min">30 minutes before</SelectItem>
                            <SelectItem value="1hour">1 hour before</SelectItem>
                            <SelectItem value="1day">1 day before</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddEvent}>Add Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

