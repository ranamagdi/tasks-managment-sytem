import { api } from "./api";
import type { Task, StatusVariant } from "../../types/apiTypes";

export const createTask = (data: Partial<Task>) => {
  return api.post("/rest/v1/tasks", data);
};

export const updateTask = (id: string, data: Partial<Task>) => {
  return api.patch(`/rest/v1/tasks?id=eq.${id}`, data);
};

export const deleteTask = (id: string) => {
  return api.delete(`/rest/v1/tasks?id=eq.${id}`);
};
export const getProjectTask = (projectId: string, id: string) => {
  return api.get<Task[]>(
    `/rest/v1/tasks?id=eq.${id}&&project_id=eq.${projectId}`,
  );
};

export const getProjectTasks = (
  projectId: string,
  status?: StatusVariant,
  limit?: number,
  offset?: number,
  searchTerm?: string,
) => {
  const hasSearch = !!searchTerm?.trim();

  let url = `/rest/v1/project_tasks?project_id=eq.${projectId}`;

  if (status) {
    url += `&status=eq.${status}`;
  }

  if (hasSearch) {
    url += `&title=ilike.%25${searchTerm}%25`;
  }

  if (limit !== undefined) {
    url += `&limit=${limit}`;
  }

  if (offset !== undefined) {
    url += `&offset=${offset}`;
  }

  return api.get<Task[]>(url, {
    headers: {
      Prefer: "count=exact",
    },
  });
};
