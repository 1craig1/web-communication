"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"

export type TaskStatus = "todo" | "in-progress" | "done"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  assignedTo?: string[]
}

export interface CourseUnit {
  id: string
  code: string
  name: string
  tasks: Task[]
}

interface TasksContextType {
  courseUnits: CourseUnit[]
  activeCourseUnitId: string | null
  setActiveCourseUnitId: (id: string | null) => void
  addCourseUnit: (courseUnit: Omit<CourseUnit, "id" | "tasks">) => void
  addTask: (courseUnitId: string, task: Omit<Task, "id">) => void
  updateTaskStatus: (courseUnitId: string, taskId: string, status: TaskStatus) => void
  updateTask: (courseUnitId: string, taskId: string, task: Partial<Task>) => void
  deleteTask: (courseUnitId: string, taskId: string) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

const defaultCourseUnits: CourseUnit[] = [
  {
    id: "info1111",
    code: "INFO1111",
    name: "Introduction to Information Technology",
    tasks: [
      {
        id: "task1",
        title: "Research Paper on Cloud Computing",
        description: "Write a 2000-word research paper on cloud computing technologies",
        status: "todo",
        priority: "high",
        dueDate: "2025-04-15",
      },
      {
        id: "task2",
        title: "Weekly Quiz 3",
        description: "Complete online quiz covering weeks 5-6 material",
        status: "in-progress",
        priority: "medium",
        dueDate: "2025-04-05",
      },
      {
        id: "task3",
        title: "Lab Assignment 2",
        description: "Complete and submit lab exercises on database design",
        status: "done",
        priority: "high",
        dueDate: "2025-03-28",
      },
    ],
  },
  {
    id: "info2222",
    code: "INFO2222",
    name: "Web Information Technologies",
    tasks: [
      {
        id: "task4",
        title: "Group Project: Website Development",
        description: "Develop a responsive website for a fictional business",
        status: "in-progress",
        priority: "high",
        dueDate: "2025-05-10",
      },
      {
        id: "task5",
        title: "JavaScript Exercise",
        description: "Complete the JavaScript exercises in Chapter 8",
        status: "todo",
        priority: "medium",
        dueDate: "2025-04-08",
      },
    ],
  },
  {
    id: "comp2123",
    code: "COMP2123",
    name: "Data Structures and Algorithms",
    tasks: [
      {
        id: "task6",
        title: "Algorithm Implementation",
        description: "Implement and analyze the efficiency of sorting algorithms",
        status: "todo",
        priority: "high",
        dueDate: "2025-04-20",
      },
      {
        id: "task7",
        title: "Weekly Problem Set 4",
        description: "Solve problems related to graph algorithms",
        status: "in-progress",
        priority: "medium",
        dueDate: "2025-04-07",
      },
      {
        id: "task8",
        title: "Midterm Exam Preparation",
        description: "Review chapters 1-5 and complete practice questions",
        status: "todo",
        priority: "high",
        dueDate: "2025-04-12",
      },
    ],
  },
]

export function TasksProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>(defaultCourseUnits)
  const [activeCourseUnitId, setActiveCourseUnitId] = useState<string | null>(null)

  // Initialize from localStorage on first render
  useEffect(() => {
    const storedCourseUnits = localStorage.getItem("courseUnits")
    const storedActiveCourseUnitId = localStorage.getItem("activeCourseUnitId")

    if (storedCourseUnits) {
      setCourseUnits(JSON.parse(storedCourseUnits))
    }

    if (storedActiveCourseUnitId) {
      setActiveCourseUnitId(storedActiveCourseUnitId)
    }

    setInitialized(true)
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!initialized) return

    localStorage.setItem("courseUnits", JSON.stringify(courseUnits))
    if (activeCourseUnitId) {
      localStorage.setItem("activeCourseUnitId", activeCourseUnitId)
    }
  }, [initialized, courseUnits, activeCourseUnitId])

  const addCourseUnit = (courseUnit: Omit<CourseUnit, "id" | "tasks">) => {
    const newCourseUnit: CourseUnit = {
      ...courseUnit,
      id: uuidv4(),
      tasks: [],
    }
    setCourseUnits([...courseUnits, newCourseUnit])
  }

  const addTask = (courseUnitId: string, task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      description: task.description || "",
      dueDate: task.dueDate || "",
      assignedTo: task.assignedTo || [],
    }

    setCourseUnits((prevCourseUnits) =>
      prevCourseUnits.map((unit) => {
        if (unit.id === courseUnitId) {
          return {
            ...unit,
            tasks: [...unit.tasks, newTask],
          }
        }
        return unit
      }),
    )
  }

  const updateTaskStatus = (courseUnitId: string, taskId: string, status: TaskStatus) => {
    setCourseUnits((prevCourseUnits) =>
      prevCourseUnits.map((unit) => {
        if (unit.id === courseUnitId) {
          return {
            ...unit,
            tasks: unit.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
          }
        }
        return unit
      }),
    )
  }

  const updateTask = (courseUnitId: string, taskId: string, taskUpdates: Partial<Task>) => {
    setCourseUnits((prevCourseUnits) =>
      prevCourseUnits.map((unit) => {
        if (unit.id === courseUnitId) {
          return {
            ...unit,
            tasks: unit.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    ...taskUpdates,
                    description: taskUpdates.description ?? task.description,
                    dueDate: taskUpdates.dueDate ?? task.dueDate,
                    assignedTo: taskUpdates.assignedTo ?? task.assignedTo,
                  }
                : task,
            ),
          }
        }
        return unit
      }),
    )
  }

  const deleteTask = (courseUnitId: string, taskId: string) => {
    setCourseUnits((prevCourseUnits) =>
      prevCourseUnits.map((unit) => {
        if (unit.id === courseUnitId) {
          return {
            ...unit,
            tasks: unit.tasks.filter((task) => task.id !== taskId),
          }
        }
        return unit
      }),
    )
  }

  return (
    <TasksContext.Provider
      value={{
        courseUnits,
        activeCourseUnitId,
        setActiveCourseUnitId,
        addCourseUnit,
        addTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider")
  }
  return context
}

