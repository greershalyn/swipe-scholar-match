import { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { 
  GraduationCap, 
  WalletIcon, 
  BookOpen, 
  FileText, 
  Users, 
  Calculator,
  PencilIcon,
  School,
  User,
  LogOut,
  Trash2
} from "lucide-react"
import { DeactivateAccountDialog } from "@/components/account/DeactivateAccountDialog"
import { useAccountActions } from "@/hooks/useAccountActions"

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
  const navigate = useNavigate()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const { handleLogout } = useAccountActions()

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
      className={collapsed ? "w-12 md:w-16" : "w-56 md:w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b p-2 md:p-4">
        <div className="flex items-center gap-1 md:gap-2">
          <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          {!collapsed && (
            <div className="hidden sm:block">
              <h1 className="font-bold text-sm md:text-lg text-primary">SwipeScholar</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Dashboard</p>
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
                      <item.icon className="h-3 w-3 md:h-4 md:w-4" />
                      {!collapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-xs md:text-sm truncate">{item.title}</span>
                          <span className="text-xs text-muted-foreground hidden md:block">
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
                      <item.icon className="h-3 w-3 md:h-4 md:w-4" />
                      {!collapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-xs md:text-sm truncate">{item.title}</span>
                          <span className="text-xs text-muted-foreground hidden md:block">
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
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/questionnaire')}
                  className="hover:bg-accent/50"
                >
                  <User className="h-3 w-3 md:h-4 md:w-4" />
                  {!collapsed && (
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-xs md:text-sm truncate">Update Profile</span>
                      <span className="text-xs text-muted-foreground hidden md:block">
                        Edit your information
                      </span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="hover:bg-accent/50"
                >
                  <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                  {!collapsed && (
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-xs md:text-sm truncate">Log Out</span>
                      <span className="text-xs text-muted-foreground hidden md:block">
                        Sign out of your account
                      </span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setShowDeactivateDialog(true)}
                  className="hover:bg-red-50 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                  {!collapsed && (
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-xs md:text-sm truncate">Deactivate Account</span>
                      <span className="text-xs text-muted-foreground hidden md:block">
                        Permanently delete account
                      </span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <DeactivateAccountDialog 
        open={showDeactivateDialog} 
        onOpenChange={setShowDeactivateDialog} 
      />
    </Sidebar>
  )
}