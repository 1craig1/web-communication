"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, FileText, Home, LogOut, Menu, MessageSquare, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { MessagesProvider } from "@/contexts/message-context"
import { TasksProvider } from "@/contexts/task-context"
import { CalendarProvider } from "@/contexts/calendar-context"
import { DocumentProvider } from "@/contexts/document-context"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        active
          ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-50"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      router.push("/")
    }
  }, [user, router])

  // If no user, show loading or nothing
  if (!user) {
    return null
  }

  const navItems = [
    { href: "/dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { href: "/dashboard/messages", icon: <MessageSquare className="h-5 w-5" />, label: "Messages" },
    { href: "/dashboard/tasks", icon: <FileText className="h-5 w-5" />, label: "Tasks" },
    { href: "/dashboard/calendar", icon: <Calendar className="h-5 w-5" />, label: "Calendar" },
    { href: "/dashboard/documents", icon: <FileText className="h-5 w-5" />, label: "Documents" },
  ]

  const handleSignOut = () => {
    signOut()
  }

  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <MessagesProvider>
        <TasksProvider>
          <CalendarProvider>
            <DocumentProvider>
              <div className="flex min-h-screen flex-col">
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
                  <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                  <div className="flex-1">
                    <h1 className="text-lg font-semibold">WorkSpace</h1>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </header>

                {/* Mobile Sidebar */}
                {sidebarOpen && (
                  <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-80 bg-background p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">WorkSpace</h2>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <nav className="mt-8 flex flex-col gap-2">
                        {navItems.map((item) => (
                          <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={pathname === item.href}
                          />
                        ))}
                      </nav>
                      <div className="mt-auto pt-4">
                        <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-1">
                  {/* Desktop Sidebar */}
                  <aside className="hidden w-64 flex-col border-r bg-muted/10 md:flex">
                    <div className="flex h-16 items-center gap-2 border-b px-6">
                      <h2 className="text-lg font-semibold">WorkSpace</h2>
                    </div>
                    <nav className="flex-1 overflow-auto p-4">
                      <div className="grid gap-2">
                        {navItems.map((item) => (
                          <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={pathname === item.href}
                          />
                        ))}
                      </div>
                    </nav>
                    <div className="border-t p-4">
                      <div className="flex items-center gap-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Avatar className="h-9 w-9 cursor-pointer">
                              <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                              <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut}>
                              <LogOut className="mr-2 h-4 w-4" />
                              Sign out
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                          <span className="sr-only">Settings</span>
                        </Button>
                      </div>
                    </div>
                  </aside>

                  {/* Main Content */}
                  <main className="flex-1 overflow-auto">{children}</main>
                </div>
              </div>
            </DocumentProvider>
          </CalendarProvider>
        </TasksProvider>
      </MessagesProvider>
    </ThemeProvider>
  )
}

