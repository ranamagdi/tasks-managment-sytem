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

    // 1. Parse URL hash
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));

    const accessToken = params.get("access_token");
    const type = params.get("type");

    const error = params.get("error");
    const errorCode = params.get("error_code");

    // 2. Handle error case
    if (error || errorCode) {
      router.replace(`/reset-password?error=${errorCode || "invalid_link"}`);
      return;
    }

    // 3. If token exists → save it
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
        `/reset-password?access_token=${accessToken}&type=recovery`
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