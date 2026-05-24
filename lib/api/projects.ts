import { api } from "./api";
import type { Project } from "../../types/apiTypes";

export const createProject = (data: { name: string; description: string }) =>
  api.post("/rest/v1/projects", data);

export const getProjects = (limit?: number, offset?: number) => {
  const params = new URLSearchParams();

  if (limit !== undefined) params.append("limit", limit.toString());
  if (offset !== undefined) params.append("offset", offset.toString());

  const query = params.toString();

  return api.get(`/rest/v1/rpc/get_projects${query ? `?${query}` : ""}`, {
    headers: { Prefer: "count=exact" },
    returnHeaders: true,
  });
};

export const getProject = (id: string) =>
  api.get(`/rest/v1/rpc/get_projects?id=eq.${id}`);

export const updateProject = (id: string, data: Partial<Project>) =>
  api.patch(`/rest/v1/projects?id=eq.${id}`, data);

export const getProjectMembers = (projectId: string) =>
  api.get(`/rest/v1/get_project_members?project_id=eq.${projectId}`);
