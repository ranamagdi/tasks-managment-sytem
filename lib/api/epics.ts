import { api } from "./api";
import type { Epic, Task } from "../../types/apiTypes";

export const createEpic = (data: Partial<Epic>) =>
  api.post("/rest/v1/epics", data);

export const updateEpic = (id: string, data: Partial<Epic>) =>
  api.patch(`/rest/v1/epics?id=eq.${id}`, data);

export const deleteEpic = (id: string) =>
  api.delete(`/rest/v1/epics?id=eq.${id}`);

export const getProjectEpics = (
  projectId: string,
  limit: number,
  offset: number,
  searchTerm?: string,
) => {
  const hasSearch = !!searchTerm?.trim();

  const url = hasSearch
    ? `/rest/v1/project_epics?project_id=eq.${projectId}&limit=${limit}&offset=${offset}&title=ilike.%25${searchTerm}%25`
    : `/rest/v1/project_epics?project_id=eq.${projectId}&limit=${limit}&offset=${offset}`;

  return api.get(url, { headers: { Prefer: "count=exact" } });
};

export const getProjectEpic = (projectId: string, id?: string) => {
  let url = `/rest/v1/project_epics?project_id=eq.${projectId}`;
  if (id) url += `&id=eq.${id}`;
  return api.get(url);
};

export const getEpicTasks = (epicId: string) =>
  api.get<Task[]>(`/rest/v1/tasks?epic_id=eq.${epicId}`);
