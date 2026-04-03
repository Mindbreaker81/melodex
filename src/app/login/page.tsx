"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithPin, createFamily } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = /^\d{4,6}$/.test(pin);

  async function handleSubmit() {
    if (!isValid) return;
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const familyId = await loginWithPin(pin);
        if (!familyId) {
          setError("PIN incorrecto");
          setLoading(false);
          return;
        }
      } else {
        await createFamily(pin);
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <h1 className="text-4xl font-bold text-purple-600">🎹 Melodex</h1>

        <p className="text-center text-lg text-gray-600">
          {mode === "login"
            ? "Ingresa el PIN familiar"
            : "Crea un PIN familiar (4-6 dígitos)"}
        </p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••"
          value={pin}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPin(v);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isValid) handleSubmit();
          }}
          className="w-full rounded-2xl border-2 border-purple-300 px-6 py-4 text-center text-3xl tracking-[0.5em] outline-none focus:border-purple-500"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="button"
          disabled={!isValid || loading}
          onClick={handleSubmit}
          className="w-full rounded-2xl bg-green-500 px-8 py-4 text-xl font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading
            ? "Cargando..."
            : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="text-sm text-purple-500 underline"
        >
          {mode === "login"
            ? "¿Primera vez? Crear cuenta"
            : "Ya tengo cuenta"}
        </button>
      </div>
    </main>
  );
}
