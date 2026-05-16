"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";
import { Leaf, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (resetError) {
        setError("No se pudo enviar el enlace. Verifica que el correo exista.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative bg-primary">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=1200')] bg-cover bg-center opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary" />
          <div className="relative z-10 flex flex-col items-center justify-center w-full p-8 lg:p-12 text-white">
            <Leaf className="w-16 h-16 lg:w-20 lg:h-20 mb-4 lg:mb-6" />
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">Ecosenda</h1>
            <p className="text-lg lg:text-xl text-center max-w-md">
              Únete a las brigadas comunitarias de limpieza en Guadalajara y hagamos juntos un cambio positivo.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Correo enviado</h2>
            <p className="text-foreground-muted mb-6 sm:mb-8 text-sm sm:text-base">
              Hemos enviado un enlace de recuperación a <strong className="break-all">{email}</strong>.
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <p className="text-sm text-foreground-muted mb-6">
              ¿No recibiste el correo? Revisa tu carpeta de spam o intenta de nuevo.
            </p>
            <Link href="/login">
              <Button variant="secondary" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=1200')] bg-cover bg-center opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary" />
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

          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Recuperar contraseña</h2>
          <p className="text-foreground-muted mb-6 sm:mb-8 text-sm sm:text-base">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
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

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Enviar enlace de recuperación
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-foreground-muted hover:text-primary flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}