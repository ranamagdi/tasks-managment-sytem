"use client";

import Cookies from "js-cookie";

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
  }
  return url;
};

const getApiKey = () => {
  const key = process.env.NEXT_PUBLIC_API_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_API_KEY environment variable is not set");
  }
  return key;
};

const getToken = () => Cookies.get("access_token");

const refreshToken = async () => {
  const refresh = Cookies.get("refresh_token");

  const res = await fetch(
    `${getBaseUrl()}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: getApiKey(),
      },
      body: JSON.stringify({ refresh_token: refresh }),
    },
  );

  const data = await res.json();

  Cookies.set("access_token", data.access_token);
  if (data.refresh_token) Cookies.set("refresh_token", data.refresh_token);

  return data.access_token;
};

export interface CustomRequestInit extends RequestInit {
  returnHeaders?: boolean;
}

const request = async <T>(
  url: string,
  options: CustomRequestInit = {},
  retry = true,
): Promise<T> => {
  const token = getToken();

  const parseResponse = async (response: Response) => {
    const text = await response.text();
    if (!text) return null as unknown as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  };

  const res = await fetch(`${getBaseUrl()}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: getApiKey(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // auto refresh
  if (res.status === 401 && retry) {
    try {
      const newToken = await refreshToken();

      const retryRes = await fetch(`${getBaseUrl()}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          apikey: getApiKey(),
          Authorization: `Bearer ${newToken}`,
        },
      });

      return parseResponse(retryRes);
    } catch {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  if (options.returnHeaders) {
    const data = await parseResponse(res);
    return { data, headers: res.headers } as unknown as T;
  }

  return parseResponse(res);
};

export const api = {
  get: <T = unknown>(url: string, options?: CustomRequestInit) =>
    request<T>(url, { ...options, method: "GET" }),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    options?: CustomRequestInit,
  ) =>
    request<T>(url, { ...options, method: "POST", body: JSON.stringify(data) }),

  put: <T = unknown>(
    url: string,
    data?: unknown,
    options?: CustomRequestInit,
  ) =>
    request<T>(url, { ...options, method: "PUT", body: JSON.stringify(data) }),

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    options?: CustomRequestInit,
  ) =>
    request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T = unknown>(url: string, options?: CustomRequestInit) =>
    request<T>(url, { ...options, method: "DELETE" }),
};
