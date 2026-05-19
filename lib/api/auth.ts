import { api } from "./api";
import type { LoginResponse, ApiUser } from "../../types/apiTypes";

// SIGN UP
export const signUp = (data: {
  email: string;
  password: string;
  data?: {
    name: string;
    department: string;
  };
}) => {
  return api.post<LoginResponse>("/auth/v1/signup", data);
};

// LOGIN
export const login = (email: string, password: string) =>
  api.post<LoginResponse>("/auth/v1/token?grant_type=password", {
    email,
    password,
  });

// FORGOT PASSWORD
export const forgotPassword = (email: string) =>
  api.post("/auth/v1/recover", { email });

// UPDATE PASSWORD
export const updatePassword = (password: string) =>
  api.patch("/auth/v1/user", { password });

// LOGOUT
export const logout = () => api.post("/auth/v1/logout");

// GET USER
export const getUser = () => api.get<ApiUser>("/auth/v1/user");

// REFRESH TOKEN
export const refreshToken = (refresh_token: string) =>
  api.post("/auth/v1/token?grant_type=refresh_token", {
    refresh_token,
  });
