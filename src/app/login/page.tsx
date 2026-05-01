"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isValidEmail } from "@/lib/validators";
import { PromotickLogo } from "@/components/promotick-logo";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);
  const { login } = useAuth();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const email = username.trim();
    const pass = password.trim();

    // Ambos vacíos
    if (!email && !pass) {
      setError("Ingresa tu correo y contraseña");
      setErrorKey((k) => k + 1);
      return;
    }

    // Solo falta el correo
    if (!email) {
      setError("Ingresa tu correo");
      setErrorKey((k) => k + 1);
      return;
    }

    // Validar formato del correo
    if (!isValidEmail(email)) {
      setError("Ingresa un correo válido");
      setErrorKey((k) => k + 1);
      return;
    }

    // Solo falta la contraseña
    if (!pass) {
      setError("Ingresa tu contraseña");
      setErrorKey((k) => k + 1);
      return;
    }

    // Intentar login
    const err = login(email, password);
    if (err) {
      setError(err);
      setErrorKey((k) => k + 1);
      return;
    }

    router.push("/proveedores");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-sidebar lg:flex">
        {/* Decorative gradient circles */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-brand-700/8 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/5 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          {/* Logo */}
          <div className="mb-8">
            <PromotickLogo className="h-28 w-auto" />
          </div>

          <p className="mb-2 text-lg font-medium text-gray-200">
            Sistema de Gestión de Productos
          </p>

          <div className="mt-6 h-px w-48 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />

          <p className="mt-6 max-w-sm text-sm leading-relaxed text-gray-400">
            Administra tu catálogo, gestiona proveedores y exporta a
            múltiples clientes desde una sola plataforma.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 lg:w-1/2">
        {/* Mobile branding */}
        <div className="mb-10 lg:hidden">
          <PromotickLogo className="h-20 w-auto" />
        </div>

        <div className="w-full max-w-sm">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Iniciar Sesión
          </h1>
          <p className="mb-8 text-sm text-gray-500">
            Ingresa tus credenciales para acceder al sistema
          </p>


          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-5">
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Ingresa tu correo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2"
            >
              Iniciar Sesión
            </button>

            {/* Error message — appears smoothly below the button */}
            <div
              key={errorKey}
              className={`grid transition-all duration-200 ease-in-out ${error ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className={`flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${error && errorKey > 1 ? "animate-shake" : ""}`}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              </div>
            </div>
          </form>

          {/* ######## DEV-ONLY: quick login buttons — remove this block for production ############ */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Testing:</span>
            {([["admin@admin.com", "admin", "Admin"], ["user@user.com", "user", "User"]] as const).map(([email, pass, label]) => (
              <button
                key={email}
                type="button"
                onClick={() => { login(email, pass); router.push("/proveedores"); }}
                className="rounded-full border border-gray-200 px-3 py-1 text-[11px] text-gray-500 transition-colors hover:border-brand-400 hover:text-brand-600"
              >
                {label}
              </button>
            ))}
          </div>
          {/*######################### END DEV-ONLY ###########################33 */}
        </div>

        <p className="mt-16 text-xs text-gray-400">
          &copy; 2026 Promotick. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
