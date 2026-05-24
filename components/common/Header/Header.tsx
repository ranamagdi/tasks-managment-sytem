'use client';

import Cookies from "js-cookie";
import { getInitials } from "../../../lib/utils/nameUtils";
import { useAppSelector } from "@/app/store/reduxHooks";
import Image from "next/image";
import useIsMobile from "../../../lib/hooks/useIsMobile";
import { useUserQuery } from "../../../lib/hooks/queries/useUserQuery";

const Header = () => {
  const isMobile = useIsMobile();
  const isSidebarOpen = useAppSelector((state) => state.slider.isSidebarOpen);
  const accessToken = Cookies.get("access_token");

  const { data: user } = useUserQuery({ enabled: Boolean(accessToken) });

  const initials = getInitials(user?.name);
  const showLogo =
    (!isMobile && !isSidebarOpen) ||
    (!accessToken && !isSidebarOpen && isMobile);
  return (
    <header className={accessToken ? "border-b border-gray-200" : ""}>
      <nav className="mx-auto flex items-center justify-between p-6">
        <div className="flex lg:flex-1">
          {showLogo && (
            <a href="#" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Your Company"
                width={32}
                height={32}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />

              <span className="logo-name">TASKLY</span>
            </a>
          )}
        </div>

        {accessToken && user && (
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="font-medium">{user.name}</p>
              <p className="uppercase font-medium text-xs text-(--color-primary)">
                {user.department}
              </p>
            </div>

            <div className="w-10 h-10 flex items-center justify-center rounded bg-(--color-primary) text-white">
              {initials}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
