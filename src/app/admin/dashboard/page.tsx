"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Card, Skeleton } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Leaf, Activity } from "lucide-react";
import type { Brigade, BrigadeVolunteer, Profile } from "@/types/database";

type RecentActivity = {
  id: string;
  type: "brigade_created" | "volunteer_registered";
  description: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [brigadeCount, setBrigadeCount] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      const [{ count: bCount }, { data: volunteers }, { data: brigades }] = await Promise.all([
        supabase.from("brigades").select("*", { count: "exact", head: true }),
        supabase.from("brigade_volunteers").select("*").order("registered_at", { ascending: false }).limit(10),
        supabase.from("brigades").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      const uniqueUserIds = new Set(volunteers?.map(v => v.user_id) || []);
      setBrigadeCount(bCount || 0);
      setVolunteerCount(uniqueUserIds.size);
      setLastUpdated(new Date());

      const brigadeMap = new Map(brigades?.map(b => [b.id, b.title]) || []);

      const activities: RecentActivity[] = [];

      brigades?.forEach((b) => {
        activities.push({
          id: b.id,
          type: "brigade_created",
          description: `Nueva brigada: ${b.title}`,
          created_at: b.created_at,
        });
      });

      if (volunteers) {
        for (const v of volunteers) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", v.user_id).single();
          if (profile) {
            const brigadeName = brigadeMap.get(v.brigade_id) || "brigada";
            activities.push({
              id: v.brigade_id + v.user_id,
              type: "volunteer_registered",
              description: `${profile.full_name} se registró en: ${brigadeName}`,
              created_at: v.registered_at,
            });
          }
        }
      }

      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivity(activities.slice(0, 10));

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <Breadcrumb items={[{ label: "Dashboard" }]} />
      </div>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Panel de Administración</h1>
        <p className="text-foreground-muted text-sm sm:text-base">Resumen de actividad de la plataforma</p>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Skeleton variant="card" className="h-28 sm:h-32" />
            <Skeleton variant="card" className="h-28 sm:h-32" />
          </div>
          <Skeleton variant="card" className="h-56 sm:h-64" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{brigadeCount}</p>
                <p className="text-sm text-foreground-muted">Total de Brigadas</p>
              </div>
            </Card>

            <Card className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{volunteerCount}</p>
                <p className="text-sm text-foreground-muted">
                  Voluntarios Independientes
                  {lastUpdated && (
                    <span className="hidden sm:block text-xs">
                      Última actualización: {format(lastUpdated, "HH:mm")}
                    </span>
                  )}
                </p>
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Actividad Reciente</h2>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-foreground-muted text-center py-6 sm:py-8 text-sm">No hay actividad reciente.</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.type === "brigade_created" ? "bg-primary" : "bg-blue-500"}`} />
                      <span className="text-sm text-foreground truncate">{activity.description}</span>
                    </div>
                    <span className="text-xs text-foreground-muted flex-shrink-0 ml-2">
                      {format(new Date(activity.created_at), "d MMM, HH:mm", { locale: es })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}