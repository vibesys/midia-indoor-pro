
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "./UserNav";

const Layout = () => {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center px-6">
          <div className="flex-1 flex items-center">
            <SidebarTrigger />
            <h1 className="text-lg font-mono ml-4">Midia Indoor Pro</h1>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
