import { api } from "./api";

export const inviteMember = (data: {
  p_email: string;
  p_project_id: string;
  p_app_url: string;
  p_base_url: string;
}) => api.post("/rest/v1/rpc/invite_member", data);

export const acceptInvitation = (token: string) =>
  api.post("/rest/v1/rpc/accept_invitation", {
    p_token: token,
  });

  export const getProjectMembers = (projectId: string) => {
  return api.get(`/rest/v1/get_project_members?project_id=eq.${projectId}`);
};

