"use client";

const AVATARS = ["🎹", "🎵", "🎸", "🎤", "🎺", "🥁"];

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {AVATARS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl transition-transform hover:scale-110 ${
            selected === emoji
              ? "ring-4 ring-purple-500 bg-purple-100"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
