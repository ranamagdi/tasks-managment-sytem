"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Select, { type SingleValue } from "react-select";
import { type ViewOption, VIEW_OPTIONS } from "@/lib/utils/constants";
import { ViewOptionLabel } from "@/components/dashboard/Tasks/ViewOptionLabel";
import { viewSelectStyles } from "@/components/dashboard/Tasks/CustomSelectViews";
import BoardView from "@/components/dashboard/Tasks/BoardViewTasks";
import ListView from "@/components/dashboard/Tasks/ListViewTasks";
import { MobileViewTask } from "@/components/dashboard/Tasks/MobileViewTask";
import Breadcrumb from "@/components/common/Breadcrumb/Breadcrumb";
import DetailsTask from "@/components/dashboard/Tasks/DetailsTaskPopup";
import Pagination from "@/components/common/Pagination/Pagination";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PlusIcon } from "@/components/ui/SvgIcons";
import { useAppSelector } from "@/app/store/reduxHooks";
import useIsMobile from "@/lib/hooks/useIsMobile";
import { SearchIcon } from "@/components/ui/SvgIcons";
import { useTasks } from "@/lib/hooks/queries/useTasks";
import { useTasksInfinite } from "@/lib/hooks/queries/useTasksInfinite";
import type { Task } from "@/types/apiTypes";

const LIMIT = 10;

export default function Tasks() {
  const params = useParams();
  const projectId = (params.projectId as string) || "";

  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projectTitle } = useAppSelector((s) => s.project);
  const isMobile = useIsMobile();

  const view = (searchParams.get("view") as "board" | "list") || "board";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const offset = (currentPage - 1) * LIMIT;

  const selectedViewOption =
    VIEW_OPTIONS.find((o) => o.value === view) ?? VIEW_OPTIONS[0];

  const taskIdFromUrl = searchParams.get("taskId");
  const selectedTask = taskIdFromUrl
    ? { taskId: taskIdFromUrl, projectId: projectId! }
    : null;

  // Infinite Query for Mobile
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isLoading: mobileLoading,
    isFetchingNextPage,
  } = useTasksInfinite(projectId!, undefined, searchTerm);

  const mobileTasks = (
    infiniteData?.pages.flatMap((page) => page?.data ?? []) ?? []
  ).filter((task): task is Task => !!task && typeof task.id === "string");

  // Paginated Query for List View
  const {
    data: paginatedData,
    isLoading: listLoading,
    isError: listError,
  } = useTasks(projectId!, undefined, LIMIT, offset, searchTerm);

  const paginatedTasks = paginatedData?.data || [];
  const totalItems = paginatedData?.total || 0;

  useEffect(() => {
    if (!searchParams.has("view")) {
      router.push("?view=board");
    }
  }, [router, searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Inside Tasks component, add:
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !hasNextPage) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) fetchNextPage();
        },
        { threshold: 0.1 },
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasNextPage, fetchNextPage],
  );
  const handleViewChange = (option: SingleValue<ViewOption>) => {
    if (!option) return;
    const params = new URLSearchParams(searchParams);
    params.set("view", option.value);
    if (option.value === "list") params.set("page", "1");
    else params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const openTask = (taskId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("taskId", taskId);
    router.push(`?${params.toString()}`);
  };

  const closeTask = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("taskId");
    router.push(`?${params.toString()}`);
  };

  const isBoard = view === "board" && !isMobile;

  return (
    <div
      className={
        isBoard
          ? "flex flex-col h-screen overflow-hidden px-4 sm:px-6 lg:px-8 pb-4"
          : "max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 mb-25 sm:mb-0"
      }
    >
      <Breadcrumb />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 lg:items-center shrink-0">
        <div>
          <h1 className="text-[28px] font-semibold mt-2 text-[#041B3C]">
            Active Workboard
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            Curating Project {projectTitle} production pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-3">
          <Input
            placeholder="Search tasks..."
            iconPosition="left"
            className="h-12 w-full sm:h-10"
            icon={<SearchIcon />}
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <Button
            className="md:hidden gap-2"
            onClick={() =>
              router.push(`/dashboard/projects/${projectId}/tasks/new`)
            }
          >
            <PlusIcon />
            Create New Task
          </Button>

          <div className="hidden sm:grid grid-flow-col auto-cols-max items-center gap-3 justify-end">
            <Select<ViewOption, false>
              instanceId="view-select"
              options={VIEW_OPTIONS}
              value={selectedViewOption}
              onChange={handleViewChange}
              styles={viewSelectStyles}
              isSearchable={false}
              formatOptionLabel={(data) => <ViewOptionLabel data={data} />}
              components={{
                SingleValue: ({ data }) => <ViewOptionLabel data={data} />,
              }}
            />
          </div>
        </div>
      </div>

      <div className={isBoard ? "flex-1 min-h-0 overflow-hidden" : "pb-10"}>
        {isMobile ? (
          <div className="flex flex-col gap-3">
            {mobileLoading && mobileTasks.length === 0 ? (
              <div className="space-y-2 px-4 py-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : (
              <>
                {mobileTasks.map((task: Task) => (
                  <MobileViewTask
                    key={task.id}
                    task={task}
                    onClick={() => openTask(task.id)}
                  />
                ))}

                <div ref={loadMoreRef} className="h-1" />
                {isFetchingNextPage && (
                  <div className="space-y-2 px-4 py-2">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-gray-100 animate-pulse rounded"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : isBoard ? (
          <BoardView
            projectId={projectId!}
            onTaskClick={openTask}
            searchTerm={searchTerm}
          />
        ) : (
          <ListView
            tasks={paginatedTasks}
            loading={listLoading}
            error={listError ? "Failed to load tasks" : null}
            onRowClick={openTask}
            pagination={
              !listLoading &&
              paginatedTasks.length > 0 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    pageSize={LIMIT}
                    mode="compact"
                    hasMore={offset + paginatedTasks.length < totalItems}
                    itemsShown={paginatedTasks.length}
                    label="tasks"
                    handlePreviousPage={() =>
                      router.push(`?view=list&page=${currentPage - 1}`)
                    }
                    handleNextPage={() =>
                      router.push(`?view=list&page=${currentPage + 1}`)
                    }
                    handlePageClick={(p) => router.push(`?view=list&page=${p}`)}
                    getVisiblePages={function (): (number | "...")[] {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </div>
              )
            }
          />
        )}
      </div>

      {selectedTask && (
        <DetailsTask
          isOpen={true}
          taskId={selectedTask.taskId}
          projectId={selectedTask.projectId}
          onClose={closeTask}
        />
      )}
    </div>
  );
}
