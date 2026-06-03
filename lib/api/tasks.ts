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
// TASKS CALENDAR STATS
export const getTasksCalendarStats = (data: {
  p_start_date: string;
  p_end_date: string;
  p_project_id?: string | null;
  p_status?: string | null;
}) => {
  return api.post("/rest/v1/rpc/get_tasks_calendar_stats", data);
};

// TASKS COUNT PER PROJECT
export const getTasksCountPerProject = (data: {
  p_start_date: string;
  p_end_date: string;
}) => {
  return api.post("/rest/v1/rpc/get_tasks_count_per_project", data);
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
    returnHeaders: true,
  });
};
