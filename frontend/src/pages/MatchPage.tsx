import { useParams, Link } from "react-router-dom";
import type { MatchDetail } from "../types/draft";
import { api } from "../api/client";
import { useAsyncData } from "../hooks/useAsyncData";
import MatchSideColumn from "../components/MatchSideColumn";

export default function MatchPage() {
  const { gameid } = useParams<{ gameid: string }>();
  const { data: match, error } = useAsyncData<MatchDetail>(
    (signal) => api.getMatch(gameid!, signal),
    [gameid],
  );

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
          {match.league} &middot; {match.date} &middot; Patch {match.patch}
        </p>
      </div>

      <div className="flex gap-4">
        <MatchSideColumn side="blue" data={match.blue} />
        <MatchSideColumn side="red" data={match.red} />
      </div>
    </div>
  );
}
