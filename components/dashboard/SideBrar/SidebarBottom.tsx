import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useAppSelector } from "@/app/store/reduxHooks";
import {
  ProjectsIconResponsive,
  EpicsIcon,
  TasksIcon,
  MembersIcon,
  DetailsIcon,
  ProjectsIcon,
} from "./SideBarIcons";

type Props = {
  isMobile: boolean;
};

type SidebarItem = {
  label: string;
  icon: React.ComponentType<{ isActive?: boolean }>;
  path?: string;
  responsiveIcon?: React.ComponentType<{ isActive?: boolean }>;
};

const getNavItems = (projectId?: string): SidebarItem[] => [
  {
    label: "Projects",
    icon: ProjectsIcon,
    path: "/dashboard/projects",
    responsiveIcon: ProjectsIconResponsive,
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

export default function SidebarBottom({ isMobile }: Props) {
  const isOpen = useAppSelector((state) => state.slider.isSidebarOpen);

  // Next.js equivalents of react-router hooks
  const pathname = usePathname();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  const items = getNavItems(projectId);

  // Only render on mobile when sidebar is closed
  if (!(isMobile && !isOpen)) return null;

  return (
    <div className="flex items-center justify-center align-middle gap-1 mt-auto bg-(--color-surface-low) fixed bottom-0 left-0 right-0 px-2 py-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.includes(item.path?.split("/:")[0] ?? "");

        return (
          <Link
            key={item.label}
            href={item.path ?? "#"}
            className="flex flex-col items-center text-center justify-center px-3 py-2 cursor-pointer"
          >
            <Icon isActive={isActive} />
            <span
              className={`text-[10px] font-semibold pt-1 ${
                isActive ? "text-[#003D9B]" : "text-[#041B3C]"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
