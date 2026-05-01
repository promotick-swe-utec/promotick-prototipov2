"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  FolderTree,
  Package,
  Upload,
  ClipboardCheck,
  Download,
  Building2,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { PromotickLogo } from "@/components/promotick-logo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigation: NavSection[] = [
  {
    title: "CATÁLOGO",
    items: [
      { label: "Proveedores", href: "/proveedores", icon: Truck },
      { label: "Categorías", href: "/categorias", icon: FolderTree },
      { label: "Productos", href: "/catalogo", icon: Package },
    ],
  },
  {
    title: "OPERACIONES",
    items: [
      { label: "Cargar Plantilla", href: "/cargar-plantilla", icon: Upload },
      { label: "Exportar", href: "/exportar", icon: Download },
    ],
  },
  {
    title: "CONFIGURACIÓN",
    items: [
      { label: "Clientes", href: "/clientes", icon: Building2 },
      { label: "Usuarios", href: "/usuarios", icon: Users, adminOnly: true },
    ],
  },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "admin";
  const initials = user?.fullName
    ? user.fullName
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "?";

  // Reusable transition helpers
  const fadeText = `overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"}`;
  const fadeOpacity = (invert = false) =>
    `transition-opacity duration-200 ${(isCollapsed !== invert) ? "opacity-0" : "opacity-100"}`;
  const iconCol = "w-16 shrink-0 flex items-center justify-center";

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar transition-[width] duration-200 ease-in-out ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Logo & Toggle */}
      <div className="flex h-[88px] shrink-0 items-center">
        <div className="w-20 shrink-0 flex items-center justify-center">
          <button
            onClick={onToggle}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-sidebar-hover hover:text-white"
            title="Alternar menú"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <div className={fadeText + " -ml-4"}>
          <PromotickLogo className="h-8 w-auto shrink-0 min-w-[120px]" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-none">
        {navigation.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || isAdmin,
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-6">
              {/* Section header — fixed height, content crossfades */}
              <div className="relative h-6 mb-2 flex items-center">
                <p className={`px-6 text-[11px] font-semibold tracking-widest text-gray-500 whitespace-nowrap ${fadeOpacity()}`}>
                  {section.title}
                </p>
                <div className={`absolute inset-0 flex items-center justify-center ${fadeOpacity(true)}`}>
                  <div className="h-px w-8 bg-white/10 rounded" />
                </div>
              </div>
              <ul className="space-y-1 px-2">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={item.label}
                        className={`flex items-center rounded-lg py-2.5 transition-colors duration-150 ${isActive
                          ? "bg-sidebar-active text-brand-500"
                          : "text-gray-400 hover:bg-sidebar-hover hover:text-white"
                          }`}
                      >
                        <div className={iconCol}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-medium ${fadeText}`}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User area */}
      <div className="border-t border-white/10 py-4 flex items-center">
        <div className="w-20 shrink-0 flex items-center justify-center">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
            title={user?.fullName}
          >
            {initials}
          </div>
        </div>
        <div className={`flex items-center gap-3 ${fadeText} ${!isCollapsed ? "pr-3" : ""}`}>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white whitespace-nowrap">
              {user?.fullName ?? "..."}
            </p>
            <p className="truncate text-xs text-gray-500 capitalize whitespace-nowrap">
              {user?.role ?? "..."}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-md p-1.5 text-gray-500 transition-colors duration-150 hover:bg-sidebar-hover hover:text-white"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
