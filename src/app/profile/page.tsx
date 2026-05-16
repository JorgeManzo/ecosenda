"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Card, Badge, Button } from "@/components/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LogOut, MapPin, Calendar, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import type { Profile, Brigade, BrigadeVolunteer } from "@/types/database";

type HistoryItem = Brigade & { status: BrigadeVolunteer["status"] };

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "registered">("all");

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

      if (profile) {
        setUser(profile);

        const { data: registrations } = await supabase
          .from("brigade_volunteers")
          .select("*")
          .eq("user_id", data.user.id);

        if (registrations) {
          const brigadeIds = registrations.map((r) => r.brigade_id);
          const { data: brigades } = await supabase
            .from("brigades")
            .select("*")
            .in("id", brigadeIds);

          if (brigades) {
            const historyWithStatus = brigades.map((b) => {
              const reg = registrations.find((r) => r.brigade_id === b.id);
              return { ...b, status: reg?.status || "registered" };
            });
            setHistory(historyWithStatus);
          }
        }
      }
    });
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const filteredHistory = history.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground-muted">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => router.push('/brigades')}
                className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
                aria-label="Volver al menú"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground-muted" />
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-sm sm:text-lg font-bold text-white">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-foreground text-sm sm:text-base">{user.full_name}</p>
                <p className="text-xs text-foreground-muted">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px]"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Mi Perfil</h1>
          <p className="text-foreground-muted text-sm sm:text-base">
            {user.full_name} • {user.age} años
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">{history.length}</p>
            <p className="text-xs sm:text-sm text-foreground-muted">Brigadas inscritas</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-500 mb-1">
              {history.filter((h) => h.status === "completed").length}
            </p>
            <p className="text-xs sm:text-sm text-foreground-muted">Completadas</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-yellow-500 mb-1">
              {history.filter((h) => h.status === "registered").length}
            </p>
            <p className="text-xs sm:text-sm text-foreground-muted">Pendientes</p>
          </Card>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="flex gap-2 flex-wrap">
            {(["all", "registered", "completed"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Todas" : f === "registered" ? "Pendientes" : "Completadas"}
              </Button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <Card className="text-center py-8 sm:py-12">
            <p className="text-foreground-muted text-sm sm:text-base">No tienes brigadas en esta categoría.</p>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredHistory.map((brigade) => (
              <Card key={brigade.id} interactive className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {brigade.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate text-sm sm:text-base">{brigade.title}</p>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(brigade.event_date), "d MMM", { locale: es })}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{brigade.location_name}</span>
                    </span>
                  </div>
                </div>
                <Badge variant={brigade.status === "completed" ? "completed" : "upcoming"} className="text-xs sm:text-sm flex-shrink-0">
                  {brigade.status === "completed" ? "Completada" : "Pendiente"}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}