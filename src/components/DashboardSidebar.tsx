import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  GraduationCap, 
  WalletIcon, 
  BookOpen, 
  FileText, 
  Users, 
  Calculator,
  PencilIcon,
  School
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const mainNavItems = [
  { 
    title: "Scholarships", 
    url: "/", 
    icon: GraduationCap,
    description: "Swipe & match scholarships"
  },
  { 
    title: "Wallet", 
    url: "/wallet", 
    icon: WalletIcon,
    description: "Your saved scholarships"
  },
  { 
    title: "Essay Assistant", 
    url: "/essay-assistant", 
    icon: PencilIcon,
    description: "AI-powered essay help"
  },
  { 
    title: "Test Prep", 
    url: "/test-prep", 
    icon: Calculator,
    description: "SAT & ACT preparation"
  },
  { 
    title: "School Matchmaker", 
    url: "/school-matchmaker", 
    icon: School,
    description: "Find your perfect school"
  },
]

const resourcesItems = [
  { 
    title: "Financial Education", 
    url: "/financial-education", 
    icon: BookOpen,
    description: "Learn about college finances"
  },
  { 
    title: "First-Gen Resources", 
    url: "/first-gen-resources", 
    icon: Users,
    description: "Support for first-gen students"
  },
]

export function DashboardSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true
    if (path !== "/" && currentPath.startsWith(path)) return true
    return false
  }

  const getNavClassName = (path: string) =>
    isActive(path) 
      ? "bg-accent text-accent-foreground font-medium" 
      : "hover:bg-accent/50"

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg text-primary">SwipeScholar</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourcesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}