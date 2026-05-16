"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Sidebar, Skeleton } from "@/components/ui";
import { Menu, X } from "lucide-react";
import type { Profile } from "@/types/database";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/brigades");
        return;
      }

      setAdmin(profile);
      setLoading(false);
    });
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block w-60 bg-white border-r border-gray-100 p-4">
          <Skeleton variant="text" className="h-8 mb-4" />
          <div className="space-y-2">
            <Skeleton variant="text" className="h-10" />
            <Skeleton variant="text" className="h-10" />
            <Skeleton variant="text" className="h-10" />
          </div>
        </div>
        <div className="flex-1 p-4 sm:p-8">
          <Skeleton variant="card" className="h-32 mb-4" />
          <Skeleton variant="card" className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-foreground text-sm">Ecosenda Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px]"
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-foreground-muted" />
            ) : (
              <Menu className="w-5 h-5 text-foreground-muted" />
            )}
          </button>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        <div className={`
          md:hidden fixed left-0 top-0 h-full z-50 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <Sidebar
            adminName={admin?.full_name || ""}
            adminEmail={admin?.email || ""}
            onLogout={handleLogout}
          />
        </div>

        <div className="hidden md:block">
          <Sidebar
            adminName={admin?.full_name || ""}
            adminEmail={admin?.email || ""}
            onLogout={handleLogout}
          />
        </div>

        <main className="flex-1 ml-0 md:ml-60 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}