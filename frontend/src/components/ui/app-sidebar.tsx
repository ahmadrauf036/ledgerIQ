import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/modules/auth/auth.store";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LogOutIcon, LayoutDashboard, BookText, Users } from "lucide-react";
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
import { cn } from "@/lib/shadcn.utils";

export function AppSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut, loading, user, role } = useAuthStore();

    const handleLogout = async () => {
        await signOut();
        navigate("/login", { replace: true });
    };

    const menuItems = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
            roles: ["super_admin"],
        },
        {
            title: "Clients",
            url: "/clients",
            icon: Users,
            roles: ["super_admin"],
        },
    ];

    const filteredItems = menuItems.filter(
        (item) => role && item.roles.includes(role),
    );

    return (
        <Sidebar className="border-r border-white/10 bg-zinc-950 text-zinc-100">
            {/* Header */}
            <SidebarHeader className="border-b border-white/10 px-4 py-4 bg-zinc-950">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 ring-1 ring-emerald-500/30">
                        <BookText size={16} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-100">
                            LedgerIQ
                        </p>
                        <p className="text-xs capitalize text-zinc-500">
                            {role?.replace("_", " ")}
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            {/* Navigation */}
            <SidebarContent className="px-2 py-3 bg-zinc-950">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredItems.map((item) => {
                                const isActive = location.pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={cn(
                                                "rounded-md transition-colors text-zinc-400",
                                                "hover:bg-white/5! hover:text-zinc-100!",
                                                "bg-transparent!",
                                                isActive &&
                                                    "bg-emerald-500/10! text-emerald-400! hover:bg-emerald-500/10! hover:text-emerald-400!",
                                            )}
                                        >
                                            <a
                                                href={item.url}
                                                className="flex items-center gap-2"
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span className="text-sm">
                                                    {item.title}
                                                </span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t border-white/10 p-3 space-y-3 bg-zinc-950">
                {/* User info */}
                <div className="flex items-center gap-2 px-1">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 ring-1 ring-white/10">
                        {user?.email?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-zinc-300">
                            {user?.email}
                        </p>
                        <p className="text-xs capitalize text-zinc-600">
                            {role?.replace("_", " ")}
                        </p>
                    </div>
                </div>

                {/* Logout */}
                <Button
                    className="w-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
                    variant="ghost"
                    onClick={handleLogout}
                >
                    {loading ? <Spinner /> : <LogOutIcon className="h-4 w-4" />}
                    <span className="ml-2">Logout</span>
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
