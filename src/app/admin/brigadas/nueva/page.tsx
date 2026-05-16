"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button, Input, Select, Card, Breadcrumb } from "@/components/ui";
import { REQUIREMENTS_OPTIONS, EVENT_TYPES } from "@/lib/constants";
import { Calendar, Image, ListChecks } from "lucide-react";

export default function NuevaBrigadaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: "",
    eventType: "",
    description: "",
    eventDate: "",
    eventTime: "",
    locationName: "",
    locationAddress: "",
    coverImageUrl: "",
    requirements: [] as string[],
  });

  const updateField = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleRequirement = (req: string) => {
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.includes(req)
        ? prev.requirements.filter((r) => r !== req)
        : [...prev.requirements, req],
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "El título es requerido";
    if (!form.eventType) newErrors.eventType = "El tipo de evento es requerido";
    if (!form.description.trim()) newErrors.description = "La descripción es requerida";
    if (!form.eventDate) newErrors.eventDate = "La fecha es requerida";
    if (!form.eventTime) newErrors.eventTime = "La hora es requerida";
    if (!form.locationName.trim()) newErrors.locationName = "El nombre del lugar es requerido";
    if (!form.locationAddress.trim()) newErrors.locationAddress = "La dirección es requerida";
    if (form.requirements.length === 0) newErrors.requirements = "Selecciona al menos un requisito";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("brigades").insert({
      title: form.title,
      event_type: form.eventType,
      description: form.description,
      event_date: form.eventDate,
      event_time: form.eventTime,
      location_name: form.locationName,
      location_address: form.locationAddress,
      cover_image_url: form.coverImageUrl || null,
      requirements: form.requirements,
    });

    if (error) {
      setErrors({ submit: "Error al crear la brigada" });
      setLoading(false);
    } else {
      router.push("/admin/brigadas");
    }
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <Breadcrumb
          items={[
            { label: "Gestionar Brigadas", href: "/admin/brigadas" },
            { label: "Nueva Brigada" },
          ]}
        />
      </div>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Nueva Brigada</h1>
        <p className="text-foreground-muted text-sm sm:text-base">Crea una nueva brigada comunitaria</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Información</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Título de la brigada"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Limpieza en Parque Miraflores"
                error={errors.title}
                required
              />
              <Select
                label="Tipo de evento"
                value={form.eventType}
                onChange={(e) => updateField("eventType", e.target.value)}
                options={EVENT_TYPES.map((t) => ({ value: t, label: t }))}
                placeholder="Selecciona un tipo"
                error={errors.eventType}
              />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Descripción corta
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe los objetivos de la brigada..."
                  rows={3}
                  className={`
                    w-full px-4 py-2.5 rounded-lg border border-gray-200
                    bg-white text-foreground resize-none text-sm sm:text-base
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    ${errors.description ? "border-red-500" : ""}
                  `}
                />
                {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Logística
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Fecha del encuentro"
                type="date"
                value={form.eventDate}
                onChange={(e) => updateField("eventDate", e.target.value)}
                error={errors.eventDate}
                required
              />
              <Input
                label="Hora"
                type="time"
                value={form.eventTime}
                onChange={(e) => updateField("eventTime", e.target.value)}
                error={errors.eventTime}
                required
              />
              <Input
                label="Nombre del lugar"
                value={form.locationName}
                onChange={(e) => updateField("locationName", e.target.value)}
                placeholder="Parque Miraflores"
                error={errors.locationName}
                required
              />
              <Input
                label="Ubicación exacta"
                value={form.locationAddress}
                onChange={(e) => updateField("locationAddress", e.target.value)}
                placeholder="Av. López Mateos 1234, Guadalajara"
                error={errors.locationAddress}
                required
              />
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
              <Image className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Multimedia
            </h2>
            <Input
              label="URL de imagen de portada"
              type="url"
              value={form.coverImageUrl}
              onChange={(e) => updateField("coverImageUrl", e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
              <ListChecks className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Requisitos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {REQUIREMENTS_OPTIONS.map((req) => (
                <label
                  key={req}
                  className={`
                    flex items-center gap-2 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all text-xs sm:text-sm
                    ${form.requirements.includes(req)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={form.requirements.includes(req)}
                    onChange={() => toggleRequirement(req)}
                    className="w-3 h-3 sm:w-4 sm:h-4 accent-primary"
                  />
                  <span className="truncate">{req}</span>
                </label>
              ))}
            </div>
            {errors.requirements && <span className="text-sm text-red-500 mt-2 block">{errors.requirements}</span>}
          </div>

          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{errors.submit}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button type="submit" loading={loading} className="w-full sm:w-auto">
              Publicar Brigada
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/brigadas")} className="w-full sm:w-auto">
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}