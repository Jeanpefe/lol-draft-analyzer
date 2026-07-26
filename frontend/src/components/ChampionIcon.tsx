import { useState } from "react";
import { getChampionIconUrl } from "../data/championIcons";

interface ChampionIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function ChampionIcon({
  name,
  size = 40,
  className = "",
}: ChampionIconProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className={`rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-300 shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.3 }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={getChampionIconUrl(name)}
      alt={name}
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  );
}
