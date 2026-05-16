"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";
import { Leaf, Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        const errorMessages: Record<string, string> = {
          "Invalid login credentials": "Credenciales incorrectas. Verifica tu correo y contraseña.",
          "Email not confirmed": "Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.",
          "User not found": "No existe una cuenta con este correo.",
          "Invalid email": "El formato del correo no es válido.",
        };
        setError(errorMessages[authError.message] || "Error al iniciar sesión. Intenta de nuevo.");
        return;
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError || !profile) {
          router.push("/register");
          return;
        }

        if (profile.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/brigades");
        }
      }
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary">
        <div className="absolute inset-0 bg-[url('https://plus.unsplash.com/premium_photo-1681152790484-8c0beab3999a?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-primary" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-8 lg:p-12 text-white">
          <Leaf className="w-16 h-16 lg:w-20 lg:h-20 mb-4 lg:mb-6" />
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">Ecosenda</h1>
          <p className="text-lg lg:text-xl text-center max-w-md">
            Únete a las brigadas comunitarias de limpieza en Guadalajara y hagamos juntos un cambio positivo.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-foreground">Ecosenda</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Iniciar sesión</h2>
          <p className="text-foreground-muted mb-6 sm:mb-8 text-sm sm:text-base">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-[calc(50%+10px)] -translate-y-1/2 text-foreground-muted hover:text-foreground transition-opacity p-1 min-h-[44px] min-w-[44px] flex items-center justify-center ${password.length === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                ¿Olvidé mi contraseña?
              </Link>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Iniciar sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}