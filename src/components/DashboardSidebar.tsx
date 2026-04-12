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
  Trash2,
  ShieldCheck,
  Settings
} from "lucide-react"
import { DeactivateAccountDialog } from "@/components/account/DeactivateAccountDialog"
import { useAccountActions } from "@/hooks/useAccountActions"
import { GradientIcon } from "@/components/ui/gradient-icon"
import { useUserRole } from "@/hooks/useUserRole"

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
  { title: "Scholarships", url: "/", icon: GraduationCap, description: "Swipe & match scholarships" },
  { title: "Wallet", url: "/wallet", icon: WalletIcon, description: "Your saved scholarships" },
  { title: "Essay Assistant", url: "/essay-assistant", icon: PencilIcon, description: "AI-powered essay help" },
  { title: "Test Prep", url: "/test-prep", icon: Calculator, description: "SAT & ACT preparation" },
  { title: "School Matchmaker", url: "/school-matchmaker", icon: School, description: "Find your perfect school" },
  { title: "Lewte", url: "/lewte", icon: ShieldCheck, description: "Verified student perks" },
]

const resourcesItems = [
  { title: "Financial Education", url: "/financial-education", icon: BookOpen, description: "Learn about college finances" },
  { title: "First-Gen Resources", url: "/first-gen-resources", icon: Users, description: "Support for first-gen students" },
]

const adminItem = { title: "Admin", url: "/admin", icon: Settings, description: "Manage Lewte content" }

export function DashboardSidebar() {
  const { state, isMobile } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const collapsed = state === "collapsed" && !isMobile
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const { handleLogout } = useAccountActions()
  const { isAnyAdmin } = useUserRole()

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true
    if (path !== "/" && currentPath.startsWith(path)) return true
    return false
  }

  const getNavClassName = (path: string) =>
    isActive(path) 
      ? "border border-border rounded-md font-medium text-black" 
      : "hover:bg-primary/5"

  return (
    <Sidebar
      className={collapsed ? "w-12 md:w-16" : "w-56 md:w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b p-2 md:p-4">
        <div className="flex items-center gap-1 md:gap-2">
          <GradientIcon icon={GraduationCap} className="h-6 w-6 md:h-8 md:w-8" />
          {!collapsed && (
            <div className="hidden sm:block">
              <h1 className="font-bold text-sm md:text-lg text-black">SwipeScholar</h1>
              <p className="text-xs text-gray-600 hidden md:block">Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-black font-bold">Main Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={`${getNavClassName(item.url)} flex items-center p-2 rounded-md text-black hover:bg-primary/5`}
                    >
                      <GradientIcon icon={item.icon} className="h-3 w-3 md:h-4 md:w-4" />
                      {!collapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs md:text-sm truncate text-black">{item.title}</span>
                          <span className="text-xs text-gray-600 hidden md:block">
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
          <SidebarGroupLabel className="text-black font-bold">Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourcesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClassName(item.url)} flex items-center p-2 rounded-md text-black hover:bg-primary/5`}
                    >
                      <GradientIcon icon={item.icon} className="h-3 w-3 md:h-4 md:w-4" />
                      {!collapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs md:text-sm truncate text-black">{item.title}</span>
                          <span className="text-xs text-gray-600 hidden md:block">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAnyAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={adminItem.url} 
                      className={`${getNavClassName(adminItem.url)} flex items-center p-2 rounded-md text-black hover:bg-primary/5`}
                    >
                      <GradientIcon icon={adminItem.icon} className="h-3 w-3 md:h-4 md:w-4" />
                      {!collapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs md:text-sm truncate text-black">{adminItem.title}</span>
                          <span className="text-xs text-gray-600 hidden md:block">
                            {adminItem.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-black font-bold">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/questionnaire')}
                  className="flex items-center p-2 rounded-md text-black hover:bg-primary/5"
                >
                  <GradientIcon icon={User} className="h-3 w-3 md:h-4 md:w-4" />
                  {!collapsed && (
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs md:text-sm truncate text-black">Update Profile</span>
                      <span className="text-xs text-gray-600 hidden md:block">
                        Edit your information
                      </span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="flex items-center p-2 rounded-md text-black hover:bg-primary/5"
                >
                  <GradientIcon icon={LogOut} className="h-3 w-3 md:h-4 md:w-4" />
                  {!collapsed && (
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs md:text-sm truncate text-black">Log Out</span>
                      <span className="text-xs text-gray-600 hidden md:block">
                        Sign out of your account
                      </span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setShowDeactivateDialog(true)}
                  className="flex items-center p-2 rounded-md text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-700" />
                  {!collapsed && (
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs md:text-sm truncate text-red-700">Deactivate Account</span>
                      <span className="text-xs text-gray-600 hidden md:block">
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
