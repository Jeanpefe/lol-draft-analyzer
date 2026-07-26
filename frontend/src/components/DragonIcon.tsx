const DRAGON_MAP: Record<string, string> = {
  infernals: "/dragons/infernal.png",
  mountains: "/dragons/mountain.png",
  clouds: "/dragons/cloud.png",
  oceans: "/dragons/ocean.png",
  chemtechs: "/dragons/chemtech.png",
  hextechs: "/dragons/hextech.png",
  elders: "/dragons/elder.png",
};

export default function DragonIcon({
  type,
  size = 16,
}: {
  type: string;
  size?: number;
}) {
  const src = DRAGON_MAP[type];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={type}
      width={size}
      height={size}
      className="inline-block"
      style={{ imageRendering: "auto" }}
    />
  );
}

export function DragonSummary({
  dragons,
  infernals = 0,
  mountains = 0,
  clouds = 0,
  oceans = 0,
  chemtechs = 0,
  hextechs = 0,
  elders = 0,
  size = 14,
}: {
  dragons: number;
  infernals?: number;
  mountains?: number;
  clouds?: number;
  oceans?: number;
  chemtechs?: number;
  hextechs?: number;
  elders?: number;
  size?: number;
}) {
  const types: [string, number][] = [
    ["infernals", infernals],
    ["mountains", mountains],
    ["clouds", clouds],
    ["oceans", oceans],
    ["chemtechs", chemtechs],
    ["hextechs", hextechs],
  ];
  const icons: { type: string; count: number }[] = [];
  for (const [type, count] of types) {
    for (let i = 0; i < count; i++) {
      icons.push({ type, count: 1 });
    }
  }
  if (elders > 0) {
    for (let i = 0; i < elders; i++) {
      icons.push({ type: "elders", count: 1 });
    }
  }

  if (icons.length === 0 && dragons === 0) {
    return <span className="text-gray-600">0</span>;
  }

  if (icons.length === 0) {
    return <span className="text-gray-400 tabular-nums">{dragons}</span>;
  }

  return (
    <span className="inline-flex items-center gap-0.5 flex-wrap">
      {icons.map((icon, i) => (
        <DragonIcon key={`${icon.type}-${i}`} type={icon.type} size={size} />
      ))}
    </span>
  );
}
