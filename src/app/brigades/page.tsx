"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BrigadeFeed } from "@/features/brigades/components/brigade-feed";
import { Leaf, Menu, LogOut, User, Settings } from "lucide-react";

export default function BrigadesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    });
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">Ecosenda</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-foreground-muted" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-medium z-20 overflow-hidden">
                    <div className="p-3 sm:p-4 border-b border-gray-100">
                      <p className="text-sm sm:text-base font-medium text-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="p-1 sm:p-2">
                      <button
                        onClick={() => { router.push("/profile"); setMenuOpen(false); }}
                        className="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-foreground hover:bg-gray-50 rounded-lg transition-colors min-h-[44px]"
                      >
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        Historial
                      </button>
                      <button
                        onClick={() => { router.push("/profile/change-password"); setMenuOpen(false); }}
                        className="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-foreground hover:bg-gray-50 rounded-lg transition-colors min-h-[44px]"
                      >
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                        Cambiar contraseña
                      </button>
                      <div className="border-t border-gray-100 my-1 sm:my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px]"
                      >
                        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Brigadas disponibles</h1>
          <p className="text-foreground-muted text-sm sm:text-base">
            Únete a una brigada y ayuda a mantener Guadalajara limpio
          </p>
        </div>

        <BrigadeFeed />
      </main>
    </div>
  );
}