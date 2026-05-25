"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";

import SidebarBottom from "./SidebarBottom";

import { useAppDispatch, useAppSelector } from "@/app/store/reduxHooks";
import { closeSidebar, openSidebar } from "@/app/store/slices/ui/sliderSlice";

import { logout } from "@/lib/api/auth";
import useIsMobile from "@/lib/hooks/useIsMobile";

import {
  ProjectsIcon,
  EpicsIcon,
  TasksIcon,
  MembersIcon,
  DetailsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogoutIcon,
  Menu,
  ProjectsIconResponsive,
  StatisticsIcon,
} from "./SideBarIcons";

type IconProps = {
  isActive?: boolean;
};

type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<IconProps>;
  responsiveIcon?: React.ComponentType<IconProps>;
};

const getNavItems = (projectId?: string): NavItem[] => [
  {
    label: "Projects",
    icon: ProjectsIcon,
    path: "/dashboard/projects",
    responsiveIcon: ProjectsIconResponsive,
  },
  {
    label: "My Statistics",
    icon: StatisticsIcon,
    path: "/dashboard/my-statistics",
  },

  ...(projectId
    ? [
        {
          label: "Project Epics",
          icon: EpicsIcon,
          path: `/dashboard/project/${projectId}/epics`,
        },
        {
          label: "Project Tasks",
          icon: TasksIcon,
          path: `/dashboard/project/${projectId}/tasks`,
        },
        {
          label: "Project Members",
          icon: MembersIcon,
          path: `/dashboard/project/${projectId}/members`,
        },
        {
          label: "Project Details",
          icon: DetailsIcon,
          path: `/dashboard/project/${projectId}/edit`,
        },
      ]
    : []),
];

type Props = {
  children: React.ReactNode;
};

export default function SidebarLayout({ children }: Props) {
  const queryClient = useQueryClient();

  const dispatch = useAppDispatch();

  const pathname = usePathname();

  const params = useParams();

  const projectId = params?.projectId as string | undefined;

  const isOpen = useAppSelector((state) => state.slider.isSidebarOpen);

  const isMobile = useIsMobile();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  const navItems = getNavItems(projectId);

  const handleLogout = async () => {
    try {
      await logout();

      Cookies.remove("access_token");

      Cookies.remove("refresh_token");

      queryClient.clear();

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          onClick={() => dispatch(closeSidebar())}
          className="fixed inset-0 z-40 bg-black/40"
        />
      )}

      <aside
        className={`
    h-screen
    bg-(--color-surface-low)
    transition-all duration-300 ease-in-out
    flex flex-col py-4

    ${
      isMobile
        ? `w-64 px-3 fixed top-0 left-0 z-50 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`
        : `${
            collapsed
              ? "w-14 px-2 sticky top-0 h-screen"
              : "w-52 px-3 fixed top-0 left-0 z-50"
          }`
    }
  `}
      >
        <div className="flex items-center gap-2.5 mb-6 pl-1">
          {!collapsed && <span className="logo-name">TASKLY</span>}
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path || pathname.startsWith(item.path);

            const IconComponent =
              isMobile && item.responsiveIcon ? item.responsiveIcon : item.icon;

            return (
              <Link
                key={item.label}
                href={item.path}
                title={collapsed ? item.label : undefined}
                className={`
                  group relative flex items-center gap-2.5
                  py-2.5 px-3 rounded-sm cursor-pointer
                  ${
                    isActive
                      ? "bg-white shadow-[0px_1px_2px_0px_#0000000D]"
                      : ""
                  }
                `}
              >
                <span className="shrink-0">
                  <IconComponent isActive={isActive} />
                </span>

                {!collapsed && (
                  <span
                    className={`text-[14px] font-medium ${
                      isActive ? "text-[#003D9B]" : "text-[#041B3C]"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <hr className="mt-7 mb-3 border border-[#C3C6D6]/15" />

        {/* Footer buttons */}
        <div className="flex flex-col gap-0.5">
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="group flex items-center gap-2.5 px-2.5 py-2 cursor-pointer"
            >
              <span className="shrink-0">
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </span>

              {!collapsed && (
                <span className="text-[14px] font-medium">Collapse</span>
              )}
            </button>
          )}

          <button
            onClick={() => setShowLogoutDialog(true)}
            className="group flex items-center gap-2.5 px-2.5 py-2 cursor-pointer"
          >
            <span className="shrink-0">
              <LogoutIcon />
            </span>

            {!collapsed && (
              <span className="text-[14px] font-medium text-[#BA1A1A]">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      <div
        className={`
    flex-1 flex flex-col min-w-0
    ${!isMobile ? (collapsed ? "ml-14" : "ml-52") : ""}
    ${isMobile ? "pb-16" : ""}
  `}
      >
        {isMobile && (
          <button
            onClick={() => dispatch(openSidebar())}
            className="absolute top-5 left-1 p-2 md:hidden flex items-center justify-between gap-2"
          >
            <Menu />

            <span className="logo-name px-2">TASKLY</span>
          </button>
        )}

        {children}
      </div>

      <SidebarBottom isMobile={isMobile} />

      {showLogoutDialog && (
        <div className="fixed inset-0 z-100 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLogoutDialog(false)}
          />

          <div className="relative z-101 w-[90%] max-w-sm rounded-lg bg-white p-5 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold">Confirm Logout</h2>

            <p className="mb-4 text-sm text-gray-600">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="rounded-md border px-3 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-3 py-2 text-sm text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
