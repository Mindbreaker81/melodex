"use client";

interface StarsProps {
  earned: number;
  total?: number;
  size?: "sm" | "md" | "lg";
}

const SIZES: Record<string, string> = {
  sm: "text-[20px]",
  md: "text-[32px]",
  lg: "text-[48px]",
};

export default function Stars({ earned, total = 3, size = "md" }: StarsProps) {
  return (
    <span
      aria-label={`${earned} de ${total} estrellas`}
      className={`inline-flex gap-1 ${SIZES[size]}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < earned ? "" : "opacity-30 grayscale"}>
          ⭐
        </span>
      ))}
    </span>
  );
}
