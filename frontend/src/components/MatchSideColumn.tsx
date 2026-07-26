import { useEffect, useState } from "react";
import type { MatchSideData } from "../types/draft";
import { getSideStyles } from "../theme";
import { ROLES, ROLE_ICONS, type Side } from "../constants";
import ChampionIcon from "./ChampionIcon";
import DamageBar from "./DamageBar";
import { DragonSummary } from "./DragonIcon";

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

export default function MatchSideColumn({
  side,
  data,
}: {
  side: Side;
  data: MatchSideData;
}) {
  const s = getSideStyles(side);
  const teamDamage = data.damagetochampions || 1;
  const logo = useTeamLogo(data.teamname);

  return (
    <div className={`flex-1 border rounded-xl overflow-hidden ${s.bg}`}>
      <div className={`${s.header} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {logo ? (
            <img
              src={logo}
              alt={data.teamname}
              className="w-8 h-8 rounded object-contain bg-gray-700/50 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-gray-700/50 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
              {data.teamname?.charAt(0)}
            </div>
          )}
          <h3 className={`font-bold text-lg ${s.text} truncate`}>
            {data.teamname}
          </h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ml-2 ${
            data.result === "Win"
              ? "bg-green-900/40 text-green-400"
              : "bg-red-900/40 text-red-400"
          }`}
        >
          {data.result}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={`text-2xl font-bold ${s.text}`}>
              {data.teamkills}
            </span>
            <span className="text-gray-600 text-lg mx-1">-</span>
            <span className="text-2xl font-bold text-gray-300">
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
            size={16}
          />
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Bans
          </p>
          <div className="flex flex-wrap gap-1">
            {data.bans.map((b: string, i: number) => (
              <ChampionIcon key={i} name={b} size={24} />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          {ROLES.map((role) => {
            const roleData = data.roles[role];
            return (
              <div key={role} className="flex items-center gap-2">
                <img
                  src={ROLE_ICONS[role]}
                  alt={role}
                  className="w-4 h-4 shrink-0 opacity-60"
                />
                {roleData?.champion && (
                  <ChampionIcon name={roleData.champion} size={22} />
                )}
                <div className="min-w-0 w-24 shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-white text-xs truncate">
                      {roleData?.champion || "-"}
                    </span>
                    <span className="text-gray-600 text-[10px]">/</span>
                    <span className="text-gray-400 text-[10px] tabular-nums">
                      {roleData?.kills ?? 0}/{roleData?.deaths ?? 0}/{roleData?.assists ?? 0}
                    </span>
                  </div>
                  <span className="text-gray-500 text-[10px] block truncate">
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
        <div className="border-t border-gray-800 pt-2 space-y-1 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Gold</span>
            <span className="tabular-nums">{data.totalgold?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Damage</span>
            <span className="tabular-nums">{data.damagetochampions?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>CS</span>
            <span className="tabular-nums">{Math.round(data.minionkills || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Vision</span>
            <span className="tabular-nums">{data.visionscore}</span>
          </div>
          <div className="flex justify-between">
            <span>Dragons</span>
            <span className="tabular-nums">{data.dragons}</span>
          </div>
          <div className="flex justify-between">
            <span>Barons</span>
            <span className="tabular-nums">{data.barons}</span>
          </div>
          <div className="flex justify-between">
            <span>Towers</span>
            <span className="tabular-nums">{data.towers}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
