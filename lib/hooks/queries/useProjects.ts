import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getProjects } from "../../api/projects";
import type { Project, ApiResponse } from "../../../types/apiTypes";

function parseResponse(res: any): { data: Project[]; total: number } {
  let data: Project[] = [];
  if (res && Array.isArray(res.data)) {
    data = res.data;
  } else if (Array.isArray(res)) {
    data = res;
  }

  const total = (() => {
    if (res && typeof res === "object" && "headers" in res) {
      const headers = (res as { headers?: Headers }).headers;
      const contentRange = headers?.get?.("content-range") ?? null;
      if (contentRange) return parseInt(contentRange.split("/")[1], 10);
    }
    return 0;
  })();

  return { data, total };
}

export const useProjects = (
  limit: number,
  offset: number,
  searchTerm?: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["projects", limit, offset, searchTerm],
    queryFn: async () => {
      const res = await getProjects(limit, offset);
      return parseResponse(res);
    },
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
};
