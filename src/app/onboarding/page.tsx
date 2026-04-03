"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import AvatarPicker from "@/components/AvatarPicker";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const canSubmit = name.trim().length > 0 && avatar !== "";

  function handleSubmit() {
    if (!canSubmit) return;

    useAppStore.getState().setStudent({
      id: crypto.randomUUID(),
      displayName: name.trim(),
      avatar,
      currentLessonId: "lesson-1",
      createdAt: new Date().toISOString(),
    });

    router.push("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-purple-600">
          ¡Bienvenido a Melodex!
        </h1>

        <input
          type="text"
          placeholder="¿Cómo te llamas?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border-2 border-purple-300 px-6 py-4 text-center text-2xl outline-none focus:border-purple-500"
        />

        <AvatarPicker selected={avatar} onSelect={setAvatar} />

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full rounded-2xl bg-green-500 px-8 py-4 text-2xl font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          ¡Empezar!
        </button>
      </div>
    </main>
  );
}
