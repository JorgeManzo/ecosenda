"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Card, Badge, Button, Skeleton, Modal } from "@/components/ui";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Calendar, Users, CheckSquare } from "lucide-react";
import type { Brigade, Profile } from "@/types/database";

const BrigadeMap = dynamic(
  () => import("./brigade-map").then((mod) => mod.BrigadeMap),
  { ssr: false, loading: () => <div className="h-48 bg-gray-100 rounded-xl animate-pulse" /> }
);

export function BrigadeFeed() {
  const router = useRouter();
  const [brigades, setBrigades] = useState<(Brigade & { volunteers: Profile[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrigade, setSelectedBrigade] = useState<(Brigade & { volunteers: Profile[] }) | null>(null);
  const [registering, setRegistering] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [registeredBrigades, setRegisteredBrigades] = useState<Set<string>>(new Set());
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [hoverRegister, setHoverRegister] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        loadRegisteredBrigades(supabase, data.user.id);
      }
    });

    const fetchBrigades = async () => {
      const { data: brigadesData } = await supabase
        .from("brigades")
        .select("*")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true });

      if (brigadesData) {
        const brigadesWithVolunteers = await Promise.all(
          brigadesData.map(async (brigade) => {
            const { data: volunteers } = await supabase.rpc("get_brigade_volunteers", {
              p_brigade_id: brigade.id,
            });

            const volunteerProfiles: Profile[] = [];
            if (volunteers && volunteers.length > 0) {
              const userIds = volunteers.map((v: { user_id: string }) => v.user_id);
              const { data: profiles } = await supabase.rpc("get_volunteer_public_info", {
                p_user_ids: userIds,
              });

              if (profiles) {
                for (const p of profiles) {
                  volunteerProfiles.push({
                    id: p.user_id,
                    full_name: p.full_name,
                    age: p.age,
                    sex: "",
                    phone: null,
                    address: null,
                    role: "user",
                    created_at: "",
                  });
                }
              }
            }

            return { ...brigade, volunteers: volunteerProfiles };
          })
        );
        setBrigades(brigadesWithVolunteers);
      }
      setLoading(false);
    };

    fetchBrigades();
  }, []);

  const loadRegisteredBrigades = async (supabase: ReturnType<typeof createClient>, userId: string) => {
    const { data: registrations } = await supabase
      .from("brigade_volunteers")
      .select("brigade_id")
      .eq("user_id", userId);

    if (registrations) {
      setRegisteredBrigades(new Set(registrations.map((r) => r.brigade_id)));
    }
  };

  const handleRegister = async (brigadeId: string) => {
    if (!user) return;
    setRegistering(true);

    const supabase = createClient();
    await supabase.from("brigade_volunteers").insert({
      brigade_id: brigadeId,
      user_id: user.id,
      status: "registered",
    });

    setRegisteredBrigades((prev) => new Set([...Array.from(prev), brigadeId]));
    setSelectedBrigade(null);
    setRegistering(false);
  };

  const handleUnregister = async (brigadeId: string) => {
    if (!user) return;
    setRegistering(true);

    const supabase = createClient();
    await supabase
      .from("brigade_volunteers")
      .delete()
      .eq("brigade_id", brigadeId)
      .eq("user_id", user.id);

    setRegisteredBrigades((prev) => {
      const newSet = new Set(prev);
      newSet.delete(brigadeId);
      return newSet;
    });
    setShowUnregisterModal(false);
    setSelectedBrigade(null);
    setRegistering(false);
  };

  const registeredBrigadesList = Array.from(registeredBrigades);
  const isUserRegistered = (brigadeId: string) => registeredBrigadesList.includes(brigadeId);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (brigades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Users className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No hay brigadas disponibles</h3>
        <p className="text-foreground-muted max-w-md text-sm sm:text-base px-4">
          Actualmente no hay brigadas programadas. ¡Vuelve pronto o contacta a un administrador para crear una nueva brigada!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {brigades.map((brigade) => (
          <Card key={brigade.id} interactive className="flex flex-col">
            {brigade.cover_image_url && (
              <div className="relative -mx-4 -mt-4 mb-4 h-36 sm:h-40 rounded-t-xl overflow-hidden">
                <img
                  src={brigade.cover_image_url}
                  alt={brigade.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="upcoming" className="text-xs sm:text-sm">{brigade.event_type}</Badge>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2 truncate">{brigade.title}</h3>
            <p className="text-sm text-foreground-muted mb-3 sm:mb-4 line-clamp-2">{brigade.description}</p>
            <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-foreground-muted mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{format(new Date(brigade.event_date), "EEEE d 'de' MMMM", { locale: es })}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{brigade.location_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{brigade.volunteers.length} voluntarios</span>
              </div>
            </div>
            <Button
              onClick={() => setSelectedBrigade(brigade)}
              variant={isUserRegistered(brigade.id) ? "secondary" : "primary"}
              className="w-full mt-auto text-sm sm:text-base"
            >
              {isUserRegistered(brigade.id) ? "Ver detalles" : "Registrarme"}
            </Button>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedBrigade && !showUnregisterModal}
        onClose={() => setSelectedBrigade(null)}
        title={selectedBrigade?.title}
      >
        {selectedBrigade && (
          <div className="space-y-4">
            <Badge variant="upcoming" className="mb-2">{selectedBrigade.event_type}</Badge>

            <p className="text-foreground">{selectedBrigade.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{format(new Date(selectedBrigade.event_date), "d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-foreground-muted">Hora:</span>
                <span>{selectedBrigade.event_time}</span>
              </div>
            </div>

            <div className="h-48 rounded-xl overflow-hidden">
              <BrigadeMap address={selectedBrigade.location_address} />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Voluntarios inscritos ({selectedBrigade.volunteers.length})
              </h4>
              {selectedBrigade.volunteers.length === 0 ? (
                <p className="text-sm text-foreground-muted">Aún no hay voluntarios inscritos.</p>
              ) : (
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedBrigade.volunteers.map((v) => (
                    <li key={v.id} className="text-sm text-foreground">
                      {v.full_name}, {v.age} años
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                Qué llevar
              </h4>
              <ul className="grid grid-cols-2 gap-1.5 text-sm">
                {selectedBrigade.requirements.map((req) => (
                  <li key={req} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {isUserRegistered(selectedBrigade.id) ? (
              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedBrigade(null)}
                  variant="secondary"
                  className="flex-1"
                >
                  Volver al menú
                </Button>
                <Button
                  onClick={() => setShowUnregisterModal(true)}
                  variant={hoverRegister ? "danger" : "primary"}
                  className="flex-1"
                  onMouseEnter={() => setHoverRegister(true)}
                  onMouseLeave={() => setHoverRegister(false)}
                >
                  {hoverRegister ? "Anular registro" : "Registrado"}
                </Button>
              </div>
            ) : (
              <Button onClick={() => handleRegister(selectedBrigade.id)} loading={registering} className="w-full">
                Confirmar registro
              </Button>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showUnregisterModal}
        onClose={() => setShowUnregisterModal(false)}
        title="Confirmar anulación"
      >
        <div className="space-y-4">
          <p className="text-foreground-muted">¿Estás seguro de esta opción?</p>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowUnregisterModal(false);
                setSelectedBrigade(null);
                router.push("/brigades");
              }}
              variant="secondary"
              className="flex-1"
            >
              Volver al menú
            </Button>
            <Button
              onClick={() => selectedBrigade && handleUnregister(selectedBrigade.id)}
              variant="danger"
              loading={registering}
              className="flex-1"
            >
              Anular registro
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}