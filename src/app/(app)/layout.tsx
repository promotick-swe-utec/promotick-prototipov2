"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: "Catálogo exportado exitosamente",
      description: "El catálogo para Tienda Ripley Web se exportó correctamente.",
      time: "Hace 2 minutos",
    },
  ]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // close notifications when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

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
            <div ref={wrapperRef} className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications((s) => !s)}
                className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-surface-alt hover:text-gray-900"
                aria-label="Notificaciones"
                aria-expanded={showNotifications}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[320px] rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50">
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-900">Notificaciones</h4>
                  </div>
                  <div className="max-h-56 divide-y overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="flex items-start gap-3 p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
                          <Check className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500">{n.description}</p>
                          <p className="mt-1 text-xs text-gray-400">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t p-2 text-right">
                    <button type="button" onClick={() => setShowNotifications(false)} className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">Cerrar</button>
                  </div>
                </div>
              )}
            </div>

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
