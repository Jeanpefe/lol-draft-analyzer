import { useCallback, useEffect, useRef, useState } from "react";
import type { DraftState, DraftAnalysis, PickRecommendation } from "../types/draft";
import { api } from "../api/client";
import { ROLES } from "../constants";

export const EMPTY_DRAFT: DraftState = {
  gameid: null,
  league: null,
  patch: null,
  blue_bans: [],
  red_bans: [],
  blue_top: null,
  blue_jng: null,
  blue_mid: null,
  blue_bot: null,
  blue_sup: null,
  red_top: null,
  red_jng: null,
  red_mid: null,
  red_bot: null,
  red_sup: null,
};

function hasAnyPick(draft: DraftState): boolean {
  return ROLES.some(
    (r) => draft[`blue_${r}` as keyof DraftState] || draft[`red_${r}` as keyof DraftState],
  );
}

export function useDraftState() {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [analysis, setAnalysis] = useState<DraftAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<PickRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const setPick = useCallback((slot: string, champion: string | null) => {
    setDraft((prev) => ({ ...prev, [slot]: champion }));
  }, []);

  const setBan = useCallback((side: "blue" | "red", champion: string) => {
    setDraft((prev) => ({
      ...prev,
      [`${side}_bans`]: [...prev[`${side}_bans`], champion],
    }));
  }, []);

  const removeBan = useCallback((side: "blue" | "red", index: number) => {
    setDraft((prev) => ({
      ...prev,
      [`${side}_bans`]: prev[`${side}_bans`].filter((_, i) => i !== index),
    }));
  }, []);

  const reset = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setAnalysis(null);
    setRecommendations([]);
  }, []);

  const getRecommendations = useCallback(
    async (slot: string) => {
      setLoading(true);
      try {
        const recs = await api.recommendPicks(draft, slot);
        setRecommendations(recs);
      } catch {
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    },
    [draft],
  );

  useEffect(() => {
    if (!hasAnyPick(draft)) {
      setAnalysis(null);
      setRecommendations([]);
      return;
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      api
        .analyzeDraft(draft, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) setAnalysis(result);
        })
        .catch((err) => {
          if (!controller.signal.aborted) {
            console.error("Draft analysis failed:", err);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [draft]);

  return {
    draft,
    analysis,
    recommendations,
    loading,
    setPick,
    setBan,
    removeBan,
    reset,
    getRecommendations,
  };
}
