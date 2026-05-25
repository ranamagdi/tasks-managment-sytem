"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Button from "../../../components/ui/Button";

import { acceptInvitation } from "../../../lib/api/members";
import toast from "react-hot-toast";
import { AcceptInvite } from "../../../components/ui/SvgIcons";
import Cookies from "js-cookie";
import Image from "next/image";
import type { ApiError } from "../../../types/apiTypes";

export default function AcceptInvetation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const token = searchParams.get("token");
  const isLoggedIn = !!Cookies.get("access_token");

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("invite_token", token);
    }

    if (!isLoggedIn) {
      sessionStorage.setItem(
        "redirect_after_login",
        pathname + `?${searchParams.toString()}`
      );

      router.replace("/login");
    }
  }, [isLoggedIn, token, router, pathname, searchParams]);

  const handleAccept = async () => {
    const finalToken = sessionStorage.getItem("invite_token");

    if (!finalToken) {
      toast.error("Invalid invitation link");
      return;
    }

    try {
      await acceptInvitation(finalToken);

      toast.success("Invitation accepted!", {
        duration: 3000,
      });

      sessionStorage.removeItem("invite_token");

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err: unknown) {
      const error = err as ApiError;

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to accept invitation";

      toast.error(message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `
          linear-gradient(0deg, #F9F9FF, #F9F9FF),
          radial-gradient(141.42% 141.42% at 100% 100%, #F1F3FF 0%, rgba(241, 243, 255, 0) 50%),
          radial-gradient(141.42% 141.42% at 0% 0%, #D7E2FF 0%, rgba(215, 226, 255, 0) 50%)
        `,
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={24} height={24} />
          <span className="logo-name">TASKLY</span>
        </div>

        <div className="md:w-xl bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{
              background: "linear-gradient(90deg, #003D9B 0%, #0052CC 100%)",
            }}
          />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--color-surface-highest) text-xs text-(--color-forms-texts) mb-4">
            <AcceptInvite />
            NEW PROJECT INVITATION
          </div>

          <h2 className="text-[30px] font-semibold text-slate-900 mb-6">
            You&apos;ve been invited to join new project
          </h2>

          <Button className="w-full" onClick={handleAccept}>
            Accept Invitation
          </Button>
        </div>
      </div>
    </div>
  );
}