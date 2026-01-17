import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  GraduationCap,
  Menu
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: LayoutDashboard,
    description: "Overview & quick actions"
  },
  { 
    title: "Student Progress", 
    url: "/students", 
    icon: Users,
    description: "Track student learning"
  },
  { 
    title: "AI Automation", 
    url: "/automation", 
    icon: Sparkles,
    description: "Automate tasks"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-coral shadow-soft">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">EduFlow</span>
              <span className="text-xs text-muted-foreground">K-5 Learning</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        h-12 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-primary text-primary-foreground shadow-soft' 
                          : 'hover:bg-muted text-foreground'
                        }
                      `}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3 px-3">
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold">{item.title}</span>
                            <span className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {item.description}
                            </span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
