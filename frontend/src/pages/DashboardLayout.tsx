import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

export default function DashboardLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 overflow-auto bg-zinc-950 min-h-screen">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
                    <SidebarTrigger className="text-zinc-400 hover:text-black" />
                </div>
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    );
}
