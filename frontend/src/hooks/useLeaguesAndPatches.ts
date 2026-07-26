import { useAsyncData } from "./useAsyncData";
import { api } from "../api/client";

export function useLeaguesAndPatches() {
  const { data: leagues } = useAsyncData<string[]>(
    (signal) => api.getLeagues(signal),
    [],
  );
  const { data: patches } = useAsyncData<string[]>(
    (signal) => api.getPatches(signal),
    [],
  );
  return { leagues: leagues ?? [], patches: patches ?? [] };
}
