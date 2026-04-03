"use client";

interface ProgressBarProps {
  completed: number;
  total: number;
  totalStars: number;
  maxStars: number;
}

export default function ProgressBar({
  completed,
  total,
  totalStars,
  maxStars,
}: ProgressBarProps) {
  const pct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">
          Lección {completed} de {total}
        </p>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-green-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <p className="text-sm text-gray-600">
        ⭐ {totalStars} / {maxStars}
      </p>
    </div>
  );
}
