
import { 
  Monitor, 
  ImageIcon, 
  Link, 
  PlaySquare, 
  LayoutDashboard,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function AppSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const mainMenuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Dispositivos",
      icon: Monitor,
      path: "/devices",
    },
    {
      title: "Mídia",
      icon: ImageIcon,
      path: "/media",
    },
    {
      title: "Links Externos",
      icon: Link,
      path: "/links",
    },
    {
      title: "Playlists",
      icon: PlaySquare,
      path: "/playlists",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4">
          <span className="text-xl font-bold">
            <span className="text-primary">Midia</span>{" "}
            <span className="text-accent">Indoor</span>{" "}
            <span className="text-primary">Pro</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gerenciamento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild onClick={() => navigate(item.path)}>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-3">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-md text-sm hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
