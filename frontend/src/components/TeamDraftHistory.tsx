import type { TeamDraftHistory } from "../types/draft";
import { ROLES } from "../constants";
import { Link } from "react-router-dom";

interface TeamDraftHistoryProps {
  data: TeamDraftHistory;
}

export default function TeamDraftHistoryComponent({
  data,
}: TeamDraftHistoryProps) {
  return (
    <div className="space-y-2">
      {data.matches.map((m) => (
        <Link
          key={m.gameid}
          to={`/match/${m.gameid}`}
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-500 transition-colors text-sm"
        >
          <span className="text-gray-400 w-24 shrink-0">{m.date}</span>
          <span className="text-gray-300 w-24 shrink-0">vs {m.opponent}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
              m.side === "Blue"
                ? "bg-blue-900/40 text-blue-300"
                : "bg-red-900/40 text-red-300"
            }`}
          >
            {m.side}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-xs font-bold ${
              m.result === "Win"
                ? "bg-green-900/40 text-green-400"
                : "bg-red-900/40 text-red-400"
            }`}
          >
            {m.result === "Win" ? "W" : "L"}
          </span>
          <span className="text-gray-500 truncate flex-1">
            {ROLES.map((r) => m.picks[r]).filter(Boolean).join(", ")}
          </span>
        </Link>
      ))}
    </div>
  );
}
