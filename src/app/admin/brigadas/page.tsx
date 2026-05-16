"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Card, Button, Badge, Breadcrumb, Skeleton } from "@/components/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PlusCircle, Download, MapPin, Calendar, ListChecks, AlertCircle } from "lucide-react";
import type { Brigade } from "@/types/database";

export default function GestionarBrigadasPage() {
  const router = useRouter();
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("brigades")
      .select("*")
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        setBrigades(data || []);
        setLoading(false);
      });
  }, []);

  const handleExportCSV = () => {
    const headers = ["Título", "Tipo", "Fecha", "Hora", "Lugar", "Dirección", "Requisitos"];
    const rows = brigades.map((b) => [
      b.title,
      b.event_type,
      b.event_date,
      b.event_time,
      b.location_name,
      b.location_address,
      b.requirements.join("; "),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `brigadas_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta brigada?")) return;
    const supabase = createClient();
    await supabase.from("brigades").delete().eq("id", id);
    setBrigades((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <Breadcrumb items={[{ label: "Gestionar Brigadas" }]} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Gestionar Brigadas</h1>
          <p className="text-foreground-muted text-sm sm:text-base">Administra las brigadas existentes</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar reporte .CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button size="sm" onClick={() => router.push("/admin/brigadas/nueva")}>
            <PlusCircle className="w-4 h-4" />
            Nueva
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-20 sm:h-24" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {brigades.map((brigade) => (
            <Card key={brigade.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{brigade.title}</h3>
                  <Badge variant="active" className="text-xs">{brigade.event_type}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {format(new Date(brigade.event_date), "d 'de' MMM, yyyy", { locale: es })}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{brigade.location_name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 sm:mt-2 text-xs sm:text-sm text-foreground-muted">
                  <ListChecks className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{brigade.requirements.length} requisitos</span>
                </div>
              </div>

              <div className="flex sm:flex-none">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(brigade.id)}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6 sm:mt-8 bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1 text-sm sm:text-base">Consejo Administrativo</h4>
            <p className="text-xs sm:text-sm text-foreground-muted">
              Mantén tus datos geográficos actualizados para que los voluntarios puedan encontrar
              fácilmente las ubicaciones de las brigadas. Verifica las direcciones antes de publicar.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}