"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { useTasks, type Task, type TaskStatus, type TaskPriority } from "@/contexts/task-context"

// This is a workaround for react-beautiful-dnd in React 18 Strict Mode
// It fixes the "Invariant failed: isDropDisabled must be a boolean" error
const StrictModeDroppable = ({ children, ...props }: any) => {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true))
    return () => {
      cancelAnimationFrame(animation)
      setEnabled(false)
    }
  }, [])

  if (!enabled) {
    return null
  }

  return <Droppable {...props}>{children}</Droppable>
}

export default function TasksPage() {
  const {
    courseUnits,
    activeCourseUnitId,
    setActiveCourseUnitId,
    addCourseUnit,
    addTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
  } = useTasks()

  const [searchQuery, setSearchQuery] = useState("")
  const [newCourseUnit, setNewCourseUnit] = useState({ code: "", name: "" })
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    dueDate: "",
    assignedTo: [],
  })

  const activeCourseUnit = courseUnits.find((unit) => unit.id === activeCourseUnitId) || null

  const handleAddCourseUnit = () => {
    if (!newCourseUnit.code.trim() || !newCourseUnit.name.trim()) return

    addCourseUnit(newCourseUnit)
    setNewCourseUnit({ code: "", name: "" })
  }

  const handleAddTask = () => {
    if (!newTask.title.trim() || !activeCourseUnitId) return

    addTask(activeCourseUnitId, newTask)
    setNewTask({
      title: "",
      description: "",
      status: "todo" as TaskStatus,
      priority: "medium" as TaskPriority,
      dueDate: "",
      assignedTo: [],
    })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !activeCourseUnitId) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column - we don't need to handle this for now
      return
    }

    // Moving from one status column to another
    const newStatus = destination.droppableId as TaskStatus
    updateTaskStatus(activeCourseUnitId, draggableId, newStatus)
  }

  const filteredCourseUnits = courseUnits.filter(
    (unit) =>
      unit.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    if (!activeCourseUnit) return []
    return activeCourseUnit.tasks.filter((task) => task.status === status)
  }

  const todoTasks = getTasksByStatus("todo")
  const inProgressTasks = getTasksByStatus("in-progress")
  const doneTasks = getTasksByStatus("done")

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Course Tasks</h1>
        <p className="text-muted-foreground">Manage your tasks for each course unit.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Course Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  {filteredCourseUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className={`p-3 rounded-lg cursor-pointer ${
                        activeCourseUnitId === unit.id ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-muted"
                      }`}
                      onClick={() => setActiveCourseUnitId(unit.id)}
                    >
                      <p className="font-medium">{unit.code}</p>
                      <p className="text-sm text-muted-foreground truncate">{unit.name}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{unit.tasks.length} tasks</span>
                        <span>•</span>
                        <span>{unit.tasks.filter((t) => t.status === "done").length} completed</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course Unit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Course Unit</DialogTitle>
                      <DialogDescription>Create a new course unit to organize your tasks.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="courseCode">Course Code</Label>
                        <Input
                          id="courseCode"
                          value={newCourseUnit.code}
                          onChange={(e) => setNewCourseUnit({ ...newCourseUnit, code: e.target.value })}
                          placeholder="e.g., INFO1111"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="courseName">Course Name</Label>
                        <Input
                          id="courseName"
                          value={newCourseUnit.name}
                          onChange={(e) => setNewCourseUnit({ ...newCourseUnit, name: e.target.value })}
                          placeholder="e.g., Introduction to Information Technology"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddCourseUnit}>Add Course</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          {activeCourseUnit ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{activeCourseUnit.code}</h2>
                  <p className="text-muted-foreground">{activeCourseUnit.name}</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                      <DialogDescription>Create a new task for {activeCourseUnit.code}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          placeholder="Task title"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          placeholder="Task description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={newTask.priority || "medium"}
                            onValueChange={(value: "low" | "medium" | "high") =>
                              setNewTask({ ...newTask, priority: value })
                            }
                          >
                            <SelectTrigger id="priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={newTask.dueDate || ""}
                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={newTask.status || "todo"}
                          onValueChange={(value: "todo" | "in-progress" | "done") =>
                            setNewTask({ ...newTask, status: value })
                          }
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddTask}>Add Task</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* To Do Column */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">To Do</h3>
                    <StrictModeDroppable droppableId="todo">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="bg-muted/30 rounded-lg p-2 min-h-[200px]"
                        >
                          {todoTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-background rounded-lg p-3 mb-2 border shadow-sm"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium">{task.title}</p>
                                      {task.description && (
                                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                      )}
                                      <div className="flex items-center gap-3 mt-2">
                                        <span
                                          className={`text-xs px-2 py-1 rounded-full ${
                                            task.priority === "high"
                                              ? "bg-red-100 text-red-800"
                                              : task.priority === "medium"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-green-100 text-green-800"
                                          }`}
                                        >
                                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                        </span>
                                        {task.dueDate && (
                                          <span className="text-xs text-muted-foreground">
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteTask(activeCourseUnitId, task.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </StrictModeDroppable>
                  </div>

                  {/* In Progress Column */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">In Progress</h3>
                    <StrictModeDroppable droppableId="in-progress">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="bg-muted/30 rounded-lg p-2 min-h-[200px]"
                        >
                          {inProgressTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-background rounded-lg p-3 mb-2 border shadow-sm"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium">{task.title}</p>
                                      {task.description && (
                                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                      )}
                                      <div className="flex items-center gap-3 mt-2">
                                        <span
                                          className={`text-xs px-2 py-1 rounded-full ${
                                            task.priority === "high"
                                              ? "bg-red-100 text-red-800"
                                              : task.priority === "medium"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-green-100 text-green-800"
                                          }`}
                                        >
                                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                        </span>
                                        {task.dueDate && (
                                          <span className="text-xs text-muted-foreground">
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteTask(activeCourseUnitId, task.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </StrictModeDroppable>
                  </div>

                  {/* Done Column */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Done</h3>
                    <StrictModeDroppable droppableId="done">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="bg-muted/30 rounded-lg p-2 min-h-[200px]"
                        >
                          {doneTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-background rounded-lg p-3 mb-2 border shadow-sm opacity-80"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium line-through">{task.title}</p>
                                      {task.description && (
                                        <p className="text-sm text-muted-foreground mt-1 line-through">
                                          {task.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-3 mt-2">
                                        <span
                                          className={`text-xs px-2 py-1 rounded-full ${
                                            task.priority === "high"
                                              ? "bg-red-100 text-red-800"
                                              : task.priority === "medium"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-green-100 text-green-800"
                                          }`}
                                        >
                                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                        </span>
                                        {task.dueDate && (
                                          <span className="text-xs text-muted-foreground">
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteTask(activeCourseUnitId, task.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </StrictModeDroppable>
                  </div>
                </div>
              </DragDropContext>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center p-6">
                <h3 className="text-lg font-medium">No course unit selected</h3>
                <p className="text-muted-foreground mt-2">
                  Select a course unit from the list or create a new one to manage tasks.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

