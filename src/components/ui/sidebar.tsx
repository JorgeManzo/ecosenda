"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, List, LogOut, Leaf } from "lucide-react";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/brigadas/nueva", label: "Nueva Brigada", icon: PlusCircle },
  { href: "/admin/brigadas", label: "Gestionar Brigadas", icon: List },
];

interface SidebarProps {
  adminName: string;
  adminEmail?: string;
  onLogout: () => void;
}

export function Sidebar({ adminName, adminEmail, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-foreground">Ecosenda</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5
                rounded-lg text-sm font-medium
                transition-colors duration-200
                ${isActive
                  ? "bg-primary/10 text-primary border-l-4 border-primary pl-2.5"
                  : "text-foreground-muted hover:bg-gray-50 hover:text-foreground"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {adminName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{adminName}</p>
            <p className="text-xs text-foreground-muted truncate">{adminEmail}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
