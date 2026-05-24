"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useAppSelector } from "../../../app/store/reduxHooks";

export default function Breadcrumb() {
  const pathname = usePathname();
  const params = useParams();

  const projectId = params?.projectId as string;

  const { projectTitle } = useAppSelector((s) => s.project);

  const segments = pathname.split("/").filter(Boolean);

  const routesMap: Record<string, string> = {
    dashboard: "Dashboard",
    projects: "Projects",
    project: "Project",
    edit: "Edit",
    epics: "Epics",
    members: "Members",
    add: "Add",
  };

  const isEditPage = pathname.includes("/edit");

  return (
    <div className="hidden mt-5 items-center gap-2 text-sm md:flex">
      {segments.map((segment, index) => {
        // hide projectId from breadcrumb
        if (segment === projectId) return null;

        const to = "/" + segments.slice(0, index + 1).join("/");

        const isLast = index === segments.length - 1;

        let label = routesMap[segment] || segment;

        if (
          segment === "project" &&
          projectTitle &&
          !isEditPage
        ) {
          label = projectTitle;
        }

        return (
          <div key={to} className="flex items-center gap-2">
            {index !== 0 && <span>/</span>}

            <Link
              href={to}
              className={
                isLast
                  ? "text-(--color-primary) text-[12px] font-bold uppercase"
                  : "text-(--color-forms-texts) text-[12px] font-semibold uppercase hover:text-(--color-primary)"
              }
            >
              {label}
            </Link>
          </div>
        );
      })}
    </div>
  );
}