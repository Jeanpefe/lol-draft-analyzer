import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { MatchDetail } from "../types/draft";
import { api } from "../api/client";
import WinRatePieChart from "../components/Charts/WinRatePieChart";

const SIDE_STYLES = {
  blue: {
    bg: "bg-blue-900/20 border-blue-800",
    header: "bg-blue-900/40",
    text: "text-blue-400",
  },
  red: {
    bg: "bg-red-900/20 border-red-800",
    header: "bg-red-900/40",
    text: "text-red-400",
  },
};

function SideColumn({
  side,
  data,
}: {
  side: "blue" | "red";
  data: MatchDetail["blue"];
}) {
  const s = SIDE_STYLES[side];
  return (
    <div className={`flex-1 border rounded-xl overflow-hidden ${s.bg}`}>
      <div className={`${s.header} px-4 py-3 flex items-center justify-between`}>
        <h3 className={`font-bold text-lg ${s.text}`}>
          {side.toUpperCase()}: {data.teamname}
        </h3>
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${
            data.result === 1
              ? "bg-green-900/40 text-green-400"
              : "bg-red-900/40 text-red-400"
          }`}
        >
          {data.result === 1 ? "WIN" : "LOSS"}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Bans
          </p>
          <div className="flex flex-wrap gap-1">
            {data.bans.map((b, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs text-gray-300"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-1.5 text-sm">
          {(["top", "jng", "mid", "bot", "sup"] as const).map((role) => (
            <div key={role} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 w-8 uppercase">
                {role}
              </span>
              <span className="text-white">
                {data[role as keyof typeof data] as string}
              </span>
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-400">
          KDA: {data.kills}/{data.deaths}/{data.assists}
        </div>
      </div>
    </div>
  );
}

export default function MatchPage() {
  const { gameid } = useParams<{ gameid: string }>();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameid) return;
    setError(null);
    api
      .getMatch(gameid)
      .then(setMatch)
      .catch(() => setError("Match not found"));
  }, [gameid]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
        <Link to="/" className="text-blue-400 text-sm mt-2 inline-block">
          Back to Meta
        </Link>
      </div>
    );
  }

  if (!match) {
    return <p className="text-gray-500 py-8 text-center">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Match: {match.gameid}</h1>
        <p className="text-gray-400 text-sm">
          {match.league} &middot; {match.date} &middot; Patch {match.patch}{" "}
          &middot; {match.duration}
        </p>
      </div>

      <div className="flex gap-4">
        <SideColumn side="blue" data={match.blue} />
        <SideColumn side="red" data={match.red} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Draft Comparison
        </h2>
        <WinRatePieChart blueWinrate={50} redWinrate={50} />
      </div>
    </div>
  );
}
