"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button, Input, Select } from "@/components/ui";
import { Leaf, Mail, User, Phone, MapPin, Check, X } from "lucide-react";

const SEX_OPTIONS = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
];

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

type Step = 1 | 2;

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

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactMethod, setContactMethod] = useState<"phone" | "address" | "">("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = "El nombre debe tener al menos 2 caracteres";
    }
    if (!age) {
      newErrors.age = "La edad es requerida";
    } else {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 18) {
        newErrors.age = "Debes tener al menos 18 años para registrarte";
      } else if (ageNum > 120) {
        newErrors.age = "La edad no es válida";
      }
    }
    if (!sex) newErrors.sex = "El sexo es requerido";
    if (!email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "El correo no es válido";
    }
    const pwdError = validatePassword(password);
    if (pwdError) {
      newErrors.password = pwdError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (!contactMethod) {
      setErrors({ contact: "Debes seleccionar al menos una opción de contacto" });
      return false;
    }
    if (contactMethod === "phone" && (!phone.trim() || phone.trim().length < 10)) {
      setErrors({ phone: "El teléfono debe tener al menos 10 dígitos" });
      return false;
    }
    if (contactMethod === "address" && !address.trim()) {
      setErrors({ address: "La dirección es requerida" });
      return false;
    }
    return true;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setErrors({});

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
          setErrors({ submit: "Este correo ya está registrado. Intenta iniciar sesión." });
        } else {
          setErrors({ submit: "Error al crear la cuenta. Intenta de nuevo." });
        }
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: fullName.trim(),
          age: parseInt(age),
          sex,
          phone: contactMethod === "phone" ? phone.trim() : null,
          address: contactMethod === "address" ? address.trim() : null,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          setErrors({ submit: "Error al crear el perfil. Por favor contacta a soporte." });
          return;
        }
      }

      router.push("/brigades");
    } catch {
      setErrors({ submit: "Ocurrió un error inesperado. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/32211250/pexels-photo-32211250.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-8 lg:p-12 text-white">
          <Leaf className="w-16 h-16 lg:w-20 lg:h-20 mb-4 lg:mb-6" />
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">Únete a Ecosenda</h1>
          <p className="text-lg lg:text-xl text-center max-w-md">
            Forma parte de las brigadas comunitarias y ayuda a mantener Guadalajara limpio.
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

          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <span className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-primary" : "bg-gray-200"}`} />
            <span className={`w-8 h-1 rounded ${step >= 2 ? "bg-primary" : "bg-gray-200"}`} />
            <span className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-primary" : "bg-gray-200"}`} />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
            {step === 1 ? "Crear cuenta" : "Información de contacto"}
          </h2>
          <p className="text-foreground-muted mb-6 sm:mb-8 text-sm sm:text-base">
            {step === 1 ? "Paso 1 de 2" : "Paso 2 de 2"}
          </p>

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4 sm:space-y-5">
              <Input
                label="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                error={errors.fullName}
                icon={<User className="w-5 h-5" />}
                required
              />

              <Input
                label="Edad"
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                error={errors.age}
                required
              />

              <Select
                label="Sexo"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                options={SEX_OPTIONS}
                placeholder="Selecciona una opción"
                error={errors.sex}
              />

              <Input
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                error={errors.email}
                icon={<Mail className="w-5 h-5" />}
                required
              />

              <div>
                <Input
                  label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea una contraseña segura"
                  error={errors.password}
                  required
                />
                {password.length > 0 && <PasswordStrength password={password} />}
              </div>

              <Button type="submit" className="w-full">
                Continuar
              </Button>

              <p className="text-center text-sm text-foreground-muted">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
              <div className="p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground-muted mb-3">
                  Elige al menos una forma de contacto para completar tu perfil:
                </p>

                <div className="space-y-3">
                  <label
                    className={`
                      flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${contactMethod === "phone" ? "border-primary bg-primary/10" : "border-gray-200 hover:border-gray-300"}
                    `}
                  >
                    <input
                      type="radio"
                      name="contact"
                      value="phone"
                      checked={contactMethod === "phone"}
                      onChange={() => setContactMethod("phone")}
                      className="w-4 h-4 accent-primary"
                    />
                    <Phone className="w-5 h-5 text-foreground-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base">Número de teléfono</p>
                      <p className="text-xs text-foreground-muted">Recibirás actualizaciones por SMS</p>
                    </div>
                  </label>

                  <label
                    className={`
                      flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${contactMethod === "address" ? "border-primary bg-primary/10" : "border-gray-200 hover:border-gray-300"}
                    `}
                  >
                    <input
                      type="radio"
                      name="contact"
                      value="address"
                      checked={contactMethod === "address"}
                      onChange={() => setContactMethod("address")}
                      className="w-4 h-4 accent-primary"
                    />
                    <MapPin className="w-5 h-5 text-foreground-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base">Dirección completa</p>
                      <p className="text-xs text-foreground-muted">Para planificar rutas de recolección</p>
                    </div>
                  </label>
                </div>

                {errors.contact && <p className="text-sm text-red-500 mt-2">{errors.contact}</p>}
              </div>

              {contactMethod === "phone" && (
                <Input
                  label="Número de teléfono"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="33 1234 5678"
                  error={errors.phone}
                  icon={<Phone className="w-5 h-5" />}
                />
              )}

              {contactMethod === "address" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Dirección completa</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Av. Vallarta 1234, Col. Americana, Guadalajara, Jalisco"
                    rows={3}
                    className={`
                      w-full px-4 py-2.5 rounded-lg border border-gray-200
                      bg-white text-foreground resize-none
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                      text-sm sm:text-base
                      ${errors.address ? "border-red-500" : ""}
                    `}
                  />
                  {errors.address && <span className="text-sm text-red-500">{errors.address}</span>}
                </div>
              )}

              {errors.submit && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  Atrás
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  Crear cuenta
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}