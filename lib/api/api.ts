"use client";

import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

const getToken = () => Cookies.get("access_token");

const refreshToken = async () => {
  const refresh = Cookies.get("refresh_token");

  const res = await fetch(`${BASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.NEXT_PUBLIC_API_KEY!,
    },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  const data = await res.json();

  Cookies.set("access_token", data.access_token);
  if (data.refresh_token) Cookies.set("refresh_token", data.refresh_token);

  return data.access_token;
};

const request = async <T>(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<T> => {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.NEXT_PUBLIC_API_KEY!,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // auto refresh
  if (res.status === 401 && retry) {
    try {
      const newToken = await refreshToken();

      const retryRes = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_API_KEY!,
          Authorization: `Bearer ${newToken}`,
        },
      });

      return retryRes.json();
    } catch {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  return res.json();
};

export const api = {
  get: <T = unknown>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "GET" }),

  post: <T = unknown>(url: string, data?: unknown) =>
    request<T>(url, { method: "POST", body: JSON.stringify(data) }),

  put: <T = unknown>(url: string, data?: unknown) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(data) }),

  patch: <T = unknown>(url: string, data?: unknown) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(data) }),

  delete: <T = unknown>(url: string) =>
    request<T>(url, { method: "DELETE" }),
}