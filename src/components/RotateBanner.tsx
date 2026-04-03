"use client";

import { useState } from "react";

export function RotateBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-blue-50 text-blue-700 text-sm text-center py-2 px-4 flex items-center justify-between portrait:flex landscape:hidden">
      <span>📱 Gira tu dispositivo para una mejor experiencia</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 text-blue-400 hover:text-blue-600"
        aria-label="Cerrar sugerencia de rotación"
      >
        ✕
      </button>
    </div>
  );
}
