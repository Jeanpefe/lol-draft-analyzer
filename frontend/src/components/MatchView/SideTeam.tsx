import { useEffect, useState } from "react";
import type { ChampionMatch, ChampionMatchSide } from "../../types/draft";
import { ROLES, ROLE_ICONS } from "../../constants";
import { formatNumber } from "../../utils/format";
import ChampionIcon from "../ChampionIcon";
import DamageBar from "../DamageBar";
import { DragonSummary } from "../DragonIcon";

let logoCache: Record<string, string> | null = null;

function useTeamLogo(teamname: string): string | null {
  const [logos, setLogos] = useState<Record<string, string> | null>(logoCache);

  useEffect(() => {
    if (logoCache) return;
    fetch("/logos/manifest.json")
      .then((r) => r.json())
      .then((data) => {
        logoCache = data;
        setLogos(data);
      })
      .catch(() => {});
  }, []);

  return logos?.[teamname] ?? null;
}

export default function SideTeam({
  side,
  match,
  highlightChamp,
}: {
  side: "blue" | "red";
  match: ChampionMatch;
  highlightChamp: string;
}) {
  const data = match[side] as ChampionMatchSide;
  const won = data.result === 1;
  const teamDamage = data.damagetochampions || 1;
  const logo = useTeamLogo(data.name);

  return (
    <div
      className={`flex-1 min-w-0 ${
        won
          ? "bg-green-950/30 border-green-900/40"
          : "bg-red-950/20 border-red-900/30"
      } border rounded-lg p-2.5`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
              won
                ? "bg-green-900/50 text-green-400"
                : "bg-red-900/50 text-red-400"
            }`}
          >
            {won ? "WIN" : "LOSS"}
          </span>
          {logo ? (
            <img
              src={logo}
              alt={data.name}
              className="w-5 h-5 rounded object-contain bg-gray-700/50 shrink-0"
            />
          ) : null}
          <span className="text-[11px] text-gray-300 font-semibold truncate">
            {data.name}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <span className={`text-lg font-bold tabular-nums ${won ? "text-green-400" : "text-gray-300"}`}>
            {data.teamkills}
          </span>
          <span className="text-gray-600 text-sm">-</span>
          <span className={`text-lg font-bold tabular-nums ${!won ? "text-green-400" : "text-gray-300"}`}>
            {data.teamdeaths}
          </span>
        </div>
        <DragonSummary
          dragons={data.dragons}
          infernals={data.infernals}
          mountains={data.mountains}
          clouds={data.clouds}
          oceans={data.oceans}
          chemtechs={data.chemtechs}
          hextechs={data.hextechs}
          elders={data.elders}
          size={13}
        />
      </div>

      <div className="space-y-1 mb-2">
        {ROLES.map((role) => {
          const roleData = data.roles[role];
          const isHighlight = roleData?.champion === highlightChamp;
          return (
            <div
              key={role}
              className={`flex items-center gap-1 text-[11px] rounded px-1 py-0.5 ${
                isHighlight ? "bg-yellow-900/30 ring-1 ring-yellow-700/40" : ""
              }`}
            >
              <img
                src={ROLE_ICONS[role]}
                alt={role}
                className="w-3.5 h-3.5 shrink-0 opacity-60"
              />
              {roleData?.champion && (
                <ChampionIcon name={roleData.champion} size={18} />
              )}
              <div className="min-w-0 w-16 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-gray-300 text-[11px] truncate">
                    {roleData?.champion || "-"}
                  </span>
                  <span className="text-gray-600 text-[9px]">/</span>
                  <span className="text-gray-500 text-[10px] tabular-nums">
                    {roleData?.kills ?? 0}/{roleData?.deaths ?? 0}/{roleData?.assists ?? 0}
                  </span>
                </div>
                <span className="text-gray-500 text-[9px] block truncate">
                  {roleData?.player || ""}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <DamageBar
                  damage={roleData?.damage ?? 0}
                  teamDamage={teamDamage}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-2">
        <p className="text-[9px] text-gray-600 uppercase mb-0.5">Bans</p>
        <div className="flex flex-wrap gap-0.5">
          {data.bans.map((b, i) => (
            <ChampionIcon key={i} name={b} size={16} />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800 pt-1.5 space-y-0.5 text-[10px]">
        <div className="flex justify-between text-gray-400">
          <span>Gold</span>
          <span className="tabular-nums">{formatNumber(data.totalgold)}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Damage</span>
          <span className="tabular-nums">{formatNumber(data.damagetochampions)}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>CS</span>
          <span className="tabular-nums">{Math.round(data.minionkills)}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Vision</span>
          <span className="tabular-nums">{data.visionscore}</span>
        </div>
      </div>
    </div>
  );
}
