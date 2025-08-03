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

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/questionnaire')}
                  className="hover:bg-accent/50"
                >
                  <User className="h-4 w-4" />
                  {!collapsed && (
                    <div className="flex flex-col">
                      <span className="font-medium">Update Profile</span>
                      <span className="text-xs text-muted-foreground">
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
                  <LogOut className="h-4 w-4" />
                  {!collapsed && (
                    <div className="flex flex-col">
                      <span className="font-medium">Log Out</span>
                      <span className="text-xs text-muted-foreground">
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
                  <Trash2 className="h-4 w-4" />
                  {!collapsed && (
                    <div className="flex flex-col">
                      <span className="font-medium">Deactivate Account</span>
                      <span className="text-xs text-muted-foreground">
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