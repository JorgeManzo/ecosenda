"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";
import { Lock, Check, X, Eye, EyeOff } from "lucide-react";

const COMMON_PASSWORDS = [
  "password", "123456", "12345678", "qwerty", "abc123",
  "password123", "admin123", "changeme", "letmein", "welcome"
];

const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "Al menos 8 caracteres", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "Una letra mayúscula", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "Una letra minúscula", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "Un número", test: (p: string) => /[0-9]/.test(p) },
];

function PasswordStrength({ password }: { password: string }) {
  return (
    <div className="mt-2 space-y-1">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const passed = req.test(password);
        return (
          <div key={req.id} className="flex items-center gap-2 text-xs">
            {passed ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-gray-400" />
            )}
            <span className={passed ? "text-green-600" : "text-gray-500"}>
              {req.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(pwd)) return "La contraseña debe tener al menos una letra mayúscula";
    if (!/[a-z]/.test(pwd)) return "La contraseña debe tener al menos una letra minúscula";
    if (!/[0-9]/.test(pwd)) return "La contraseña debe tener al menos un número";
    if (COMMON_PASSWORDS.includes(pwd.toLowerCase())) {
      return "Esta contraseña es muy común. Elige una más segura";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (currentPassword === newPassword) {
      setError("La nueva contraseña debe ser diferente a la actual");
      return;
    }

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user?.email) {
        setError("No se pudo identificar el usuario");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError("La contraseña actual es incorrecta");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError("No se pudo actualizar la contraseña. Intenta de nuevo.");
        setLoading(false);
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Contraseña actualizada</h2>
          <p className="text-foreground-muted mb-6 sm:mb-8 text-sm sm:text-base">
            Tu contraseña ha sido cambiada exitosamente.
          </p>
          <Button onClick={() => router.push("/profile")} className="w-full">
            Volver a mi perfil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <Link href="/brigades" className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-foreground-muted hover:text-foreground transition-colors min-h-[44px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Cambiar contraseña</h1>
            <p className="text-sm text-foreground-muted hidden sm:block">Actualiza tu contraseña de acceso</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="relative">
            <Input
              label="Contraseña actual"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
              required
            />
            <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className={`absolute right-3 top-[calc(50%+10px)] -translate-y-1/2 text-foreground-muted hover:text-foreground transition-opacity p-1 min-h-[44px] min-w-[44px] flex items-center justify-center ${currentPassword.length === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
          </div>

          <div className="relative">
            <Input
              label="Nueva contraseña"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
              required
            />
            <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={`absolute right-3 top-[calc(50%+10px)] -translate-y-1/2 text-foreground-muted hover:text-foreground transition-opacity p-1 min-h-[44px] min-w-[44px] flex items-center justify-center ${newPassword.length === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            {newPassword.length > 0 && <PasswordStrength password={newPassword} />}
          </div>

          <Input
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Actualizar contraseña
          </Button>
        </form>
      </main>
    </div>
  );
}