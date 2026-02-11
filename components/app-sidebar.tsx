"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  GitBranch,
  Users,
  BarChart3,
  Sparkles,
  TestTube,
  Settings,
  Bell,
  Search,
  Command,
  FolderGit2,
  Shield,
  LogOut,
  Zap,
  PanelLeft,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { CommandMenu } from "@/components/command-menu"
import { NotificationsPopover } from "@/components/notifications-popover"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderGit2,
  },
  {
    name: "Repositories",
    href: "/repositories",
    icon: GitBranch,
  },
  {
    name: "Students",
    href: "/students",
    icon: Users,
    roles: ["mentor", "admin"], // Only visible to mentors and admins
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "AI Feedback",
    href: "/ai-feedback",
    icon: Sparkles,
    badge: "New",
  },
  {
    name: "Test APIs",
    href: "/test-apis",
    icon: TestTube,
  },
  {
    name: "Admin",
    href: "/admin",
    icon: Shield,
    badge: "Admin",
    roles: ["admin"], // Only visible to admins
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()
  }, [])

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border/50">
        <SidebarHeader className="border-b border-border/50 px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity rounded-lg" />
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <Zap className="h-5 w-5 fill-white" />
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-foreground text-base tracking-tight">
                    Flux
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Intelligent Tracker
                  </span>
                </div>
              )}
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navigation
                  .filter((item: any) => {
                    // Admin specific filtering: Remove everything except Admin and Settings
                    if (user?.role === 'admin') {
                      return ['Admin', 'Settings'].includes(item.name);
                    }

                    // Mentor specific filtering
                    if (user?.role === 'mentor') {
                      const mentorTabs = ['Dashboard', 'Projects', 'Students', 'Settings'];
                      return mentorTabs.includes(item.name);
                    }

                    // Default role-based filtering for others
                    if (item.roles) {
                      return user?.role && item.roles.includes(user.role);
                    }
                    return true;
                  })
                  .map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "group relative overflow-hidden transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-foreground border-l-2 border-blue-500"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          )}
                        >
                          <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                            <item.icon className={cn(
                              "h-4 w-4 transition-colors",
                              isActive ? "text-blue-500" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            {!isCollapsed && (
                              <>
                                <span className="flex-1 font-medium text-sm">{item.name}</span>
                                {item.badge && (
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-[10px] px-1.5 py-0 h-5",
                                      item.badge === "New" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                      item.badge === "Admin" && "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                    )}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/50 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-auto p-2 hover:bg-accent/50",
                  isCollapsed && "justify-center"
                )}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 border border-border/50">
                    <AvatarImage src={user?.avatar} alt={user?.name || user?.username || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-foreground">
                      {user?.name || user?.username || 'Loading...'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {user?.email || 'No email'}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || user?.username || 'User'}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || 'No email'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                <Users className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/'
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
        <CommandMenu />
      </Sidebar>
    </>
  )
}

export function TopBar() {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()
  // Hide search on dashboard and analytics pages as requested
  const showSearch = !['/dashboard', '/analytics'].includes(pathname)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden mr-2"
        onClick={toggleSidebar}
      >
        <PanelLeft className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 items-center gap-4">
        {showSearch && (
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 h-9 px-3 text-muted-foreground hover:text-foreground bg-secondary/50 border-border/50 w-full max-w-sm justify-start"
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
            }}
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Search...</span>
            <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" /> K
            </kbd>
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* Desktop Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex text-muted-foreground hover:text-foreground"
          onClick={toggleSidebar}
          title="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <NotificationsPopover />
      </div>
    </header>
  )
}
