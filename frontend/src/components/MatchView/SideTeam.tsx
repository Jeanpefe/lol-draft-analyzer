import type { ChampionMatch, ChampionMatchSide } from "../../types/draft";
import { ROLES, ROLE_LABELS } from "../../constants";
import ChampionIcon from "../ChampionIcon";

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
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
  return (
    <div
      className={`flex-1 min-w-0 ${
        won
          ? "bg-green-950/30 border-green-900/40"
          : "bg-red-950/20 border-red-900/30"
      } border rounded-lg p-2.5`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            won
              ? "bg-green-900/50 text-green-400"
              : "bg-red-900/50 text-red-400"
          }`}
        >
          {won ? "WIN" : "LOSS"}
        </span>
        <span className="text-[11px] text-gray-300 font-semibold truncate ml-1">
          {data.name}
        </span>
      </div>

      <div className="flex items-center justify-center gap-1 mb-2">
        <span className={`text-lg font-bold tabular-nums ${won ? "text-green-400" : "text-gray-300"}`}>
          {data.teamkills}
        </span>
        <span className="text-gray-600 text-sm">-</span>
        <span className={`text-lg font-bold tabular-nums ${!won ? "text-green-400" : "text-gray-300"}`}>
          {data.teamdeaths}
        </span>
      </div>

      <div className="space-y-0.5 mb-2">
        {ROLES.map((role) => {
          const roleData = data.roles[role];
          const isHighlight = roleData?.champion === highlightChamp;
          return (
            <div
              key={role}
              className={`flex items-center gap-1.5 text-[11px] rounded px-1 py-0.5 ${
                isHighlight ? "bg-yellow-900/30 ring-1 ring-yellow-700/40" : ""
              }`}
            >
              <span className="text-[9px] font-bold text-gray-500 w-6 shrink-0 uppercase">
                {ROLE_LABELS[role]}
              </span>
              {roleData?.champion && (
                <ChampionIcon name={roleData.champion} size={20} />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-gray-300 block truncate">
                  {roleData?.champion || "-"}
                </span>
                <span className="text-gray-500 text-[10px] block truncate">
                  {roleData?.player || ""}
                </span>
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
