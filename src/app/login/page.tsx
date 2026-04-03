"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithPin, createFamily } from "@/lib/auth";
import { migrateLocalData } from "@/lib/migrate-local-data";
import type { AppState } from "@/types/storage";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [migrationPrompt, setMigrationPrompt] = useState(false);
  const [familyIdForMigration, setFamilyIdForMigration] = useState<
    string | null
  >(null);

  const isValid = /^\d{4,6}$/.test(pin);

  async function handleSubmit() {
    if (!isValid) return;
    setError("");
    setLoading(true);

    try {
      let fid: string | null = null;
      if (mode === "login") {
        fid = await loginWithPin(pin);
        if (!fid) {
          setError("PIN incorrecto");
          setLoading(false);
          return;
        }
      } else {
        fid = await createFamily(pin);
      }

      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("melodex-storage")
          : null;
      if (raw && fid) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.state?.student) {
            setFamilyIdForMigration(fid);
            setMigrationPrompt(true);
            setLoading(false);
            return;
          }
        } catch {
          // invalid JSON, ignore
        }
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  async function handleMigration(accept: boolean) {
    if (accept && familyIdForMigration) {
      const raw = window.localStorage.getItem("melodex-storage");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const localState: AppState = parsed.state;
          await migrateLocalData(localState, familyIdForMigration);
        } catch {
          // migration failed, continue anyway
        }
      }
    }
    window.localStorage.removeItem("melodex-storage");
    router.push("/");
    router.refresh();
  }

  if (migrationPrompt) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-purple-600">
            Progreso local encontrado
          </h1>
          <p className="text-center text-gray-600">
            Encontramos progreso guardado en este navegador. ¿Quieres
            importarlo a tu cuenta?
          </p>
          <button
            type="button"
            onClick={() => handleMigration(true)}
            className="w-full rounded-2xl bg-green-500 px-8 py-4 text-xl font-bold text-white transition-colors hover:bg-green-600"
          >
            Importar progreso
          </button>
          <button
            type="button"
            onClick={() => handleMigration(false)}
            className="text-sm text-gray-500 underline"
          >
            No, empezar de cero
          </button>
        </div>
      </main>
    );
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
