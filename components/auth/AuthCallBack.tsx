"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const AuthCallback = () => {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    console.log("AuthCallback running:", window.location.href);

    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.replace("#", ""));

    const accessToken =
      hashParams.get("access_token") ||
      searchParams.get("access_token") ||
      searchParams.get("token");
    const type = hashParams.get("type") || searchParams.get("type");

    const error = hashParams.get("error") || searchParams.get("error");
    const errorCode =
      hashParams.get("error_code") || searchParams.get("error_code");

    if (error || errorCode) {
      router.replace(`/reset-password?error=${errorCode || "invalid_link"}`);
      return;
    }

    if (accessToken) {
      Cookies.set("access_token", accessToken);
    }

    // 4. Redirect back to original page (invite, etc.)
    const redirectTo = sessionStorage.getItem("redirect_after_login");

    if (redirectTo) {
      sessionStorage.removeItem("redirect_after_login");
      router.replace(redirectTo);
      return;
    }

    // 5. Recovery flow (if needed)
    if (type === "recovery" && accessToken) {
      router.replace(
        `/reset-password?access_token=${accessToken}&type=recovery`,
      );
      return;
    }

    // 6. Already logged in safety check
    const existingToken = Cookies.get("access_token");

    if (existingToken) {
      router.replace("/dashboard");
      return;
    }

    // 7. Default fallback
    router.replace("/login");
  }, [router]);

  return null;
};

export default AuthCallback;
