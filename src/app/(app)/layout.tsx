"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      <main className={`min-h-screen bg-surface p-8 transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"}`}>
        {/* Top bar */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Bienvenido, <span className="font-medium text-gray-700">{user.fullName}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-surface-alt hover:text-gray-900"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {initials}
            </div>
          </div>
        </header>

        {children}
      </main>
    </>
  );
}
