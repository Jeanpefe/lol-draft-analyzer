import type { MatchSideData } from "../types/draft";
import { getSideStyles } from "../theme";
import { ROLES, ROLE_LABELS, type Side } from "../constants";
import ChampionIcon from "./ChampionIcon";

export default function MatchSideColumn({
  side,
  data,
}: {
  side: Side;
  data: MatchSideData;
}) {
  const s = getSideStyles(side);
  return (
    <div className={`flex-1 border rounded-xl overflow-hidden ${s.bg}`}>
      <div className={`${s.header} px-4 py-3 flex items-center justify-between`}>
        <h3 className={`font-bold text-lg ${s.text}`}>
          {side.toUpperCase()}: {data.teamname}
        </h3>
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${
            data.result === "Win"
              ? "bg-green-900/40 text-green-400"
              : "bg-red-900/40 text-red-400"
          }`}
        >
          {data.result}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div className="text-center">
          <span className={`text-2xl font-bold ${s.text}`}>
            {data.teamkills}
          </span>
          <span className="text-gray-600 text-lg mx-1">-</span>
          <span className="text-2xl font-bold text-gray-300">
            {data.teamdeaths}
          </span>
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
        <div className="space-y-1.5 text-sm">
          {ROLES.map((role) => {
            const roleData = data.roles[role];
            return (
              <div key={role} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 w-8 uppercase">
                  {ROLE_LABELS[role]}
                </span>
                {roleData?.champion && (
                  <ChampionIcon name={roleData.champion} size={24} />
                )}
                <div className="min-w-0">
                  <span className="text-white block">
                    {roleData?.champion || "-"}
                  </span>
                  <span className="text-gray-500 text-xs block">
                    {roleData?.player || ""}
                  </span>
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
