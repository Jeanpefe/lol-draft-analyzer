import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { TeamDraftHistory } from "../types/draft";
import { api } from "../api/client";
import TeamDraftHistoryComponent from "../components/TeamDraftHistory";

export default function TeamPage() {
  const { teamname } = useParams<{ teamname: string }>();
  const [data, setData] = useState<TeamDraftHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamname) return;
    setError(null);
    api
      .getTeamDraft(teamname)
      .then(setData)
      .catch(() => setError("Team not found"));
  }, [teamname]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <p className="text-gray-500 py-8 text-center">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{data.teamname}</h1>
        <p className="text-gray-400 text-sm">
          Draft History &middot; {data.matches.length} matches
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Recent Drafts
        </h2>
        <TeamDraftHistoryComponent data={data} />
      </div>
    </div>
  );
}
