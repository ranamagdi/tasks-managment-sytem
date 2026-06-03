"use client";

import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import EpicCard from "@/components/dashboard/Epics/EpicCard";
import Button from "@/components/ui/Button";
import { useRouter, useParams } from "next/navigation";
import {
  AddIcon,
  EmptyEpicContent,
  ErrorIcon,
  SearchIcon,
} from "@/components/ui/SvgIcons";
import Pagination from "@/components/common/Pagination/Pagination";
import EmptyContent from "@/components/common/content/EmptyContent";
import ErrorContent from "@/components/common/content/ErrorContent";
import { IMAGES } from "@/assets/index";
import EpicCardSkeleton from "@/components/dashboard/Epics/EpicCardSkelton";
import useIsMobile from "@/lib/hooks/useIsMobile";
import Input from "@/components/ui/Input";
import EpicDetailsPopup from "@/components/dashboard/Epics/EpicDetailsPopup";
import Breadcrumb from "@/components/common/Breadcrumb/Breadcrumb";
import { useEpics } from "@/lib/hooks/queries/useEpics";
import { useEpicsInfinite } from "@/lib/hooks/queries/useEpicsInfinite";
import type { Epic } from "@/types/apiTypes";

const PAGE_SIZE = 10;

export default function Epics() {
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const offset = (currentPage - 1) * PAGE_SIZE;

  const {
    data: desktopData,
    isLoading: desktopLoading,
    isError: desktopError,
  } = useEpics(projectId!, PAGE_SIZE, offset, searchTerm);

  const {
    data: infiniteData,
    isLoading: mobileLoading,
    isError: mobileError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEpicsInfinite(projectId!, searchTerm);

  const loading = isMobile ? mobileLoading : desktopLoading;
  const error = isMobile ? mobileError : desktopError;

  const allMobileEpics: Epic[] = (
    infiniteData?.pages.flatMap((p) => p.data ?? []) ?? []
  ).filter(
    (e): e is Epic => !!e && typeof e.id === "string" && !deletedIds.has(e.id),
  );

  const desktopEpics: Epic[] = (desktopData?.data ?? []).filter(
    (e): e is Epic => !!e && typeof e.id === "string" && !deletedIds.has(e.id),
  );

  const epics = isMobile ? allMobileEpics : desktopEpics;
  const totalItems = isMobile
    ? (infiniteData?.pages[0]?.total ?? 0)
    : (desktopData?.total ?? 0);
  const hasMore = isMobile ? !!hasNextPage : desktopEpics.length === PAGE_SIZE;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!isMobile) return;
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observerRef.current.observe(node);
    },
    [isMobile, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const handlePreviousPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handlePageClick = (page: number) => setCurrentPage(page);

  const getVisiblePages = (): number[] => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    )
      range.push(i);
    return range;
  };

  const handleDeleteEpic = (id: string) =>
    setDeletedIds((prev) => new Set(prev).add(id));

  const handleClosePopup = () => {
    setSelectedEpic(null);
    setCurrentPage(1);
    queryClient.invalidateQueries({ queryKey: ["epics", projectId] });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const isOutOfRange =
    !loading &&
    !error &&
    currentPage > 1 &&
    totalItems > 0 &&
    offset >= totalItems;

  if (isOutOfRange) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-9">
        <EmptyContent
          className="bg-white border border-[#FFFFFF66] backdrop-blur-xs rounded-4xl"
          image={IMAGES.EpicEmpty}
          title="No epics in this project yet."
          description="Break down your large project into manageable epics to track progress better and maintain architectural clarity."
        >
          <Button
            className="flex items-center gap-2 justify-center align-middle"
            onClick={() => setCurrentPage(1)}
          >
            Go to Page 1
          </Button>
          <EpicEmptyCards />
        </EmptyContent>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
      {!error && (epics.length !== 0 || loading) && (
        <>
          <Breadcrumb />
          <div className="grid grid-cols-12 items-center">
            <div className="col-span-12 md:col-span-8">
              <h2 className="text-[#041B3C] text-[30px] font-semibold hidden sm:block">
                Project Epics
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4 flex">
              <div className="w-full mt-4 sm:mt-0">
                <Input
                  placeholder="Search epics..."
                  iconPosition="left"
                  className="h-12 w-full sm:h-10"
                  icon={<SearchIcon />}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="hidden sm:flex items-center ml-2">
                <Button
                  onClick={() =>
                    router.push(`/dashboard/projects/${projectId}/epics/add`)
                  }
                  className="flex items-center gap-2 whitespace-nowrap mt-1"
                >
                  <AddIcon />
                  New Epic
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
        {epics.map((epic, index) => {
          const isLastElement = isMobile && epics.length === index + 1;
          return (
            <div key={epic.id} ref={isLastElement ? lastElementRef : null}>
              <EpicCard
                id={epic.id!}
                title={epic.title}
                createdAt={epic.created_at}
                projectId={epic.project_id}
                epicId={epic.epic_id}
                assigneeName={epic.assignee_name}
                createdBy={epic.created_by.name}
                deadline={epic.deadline}
                onDelete={handleDeleteEpic}
                onClick={() => setSelectedEpic(epic)}
              />
            </div>
          );
        })}

        {!loading && epics.length > 0 && (
          <div className="sm:hidden flex justify-end">
            <div
              onClick={() =>
                router.push(`/dashboard/projects/${projectId}/epics/add`)
              }
              style={{
                marginBottom: "80px",
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)",
              }}
              className="w-14 h-14 text-white rounded-2xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition"
            >
              <AddIcon />
            </div>
          </div>
        )}

        {loading &&
          Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
            <EpicCardSkeleton key={`skeleton-${i}`} />
          ))}

        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, i) => (
            <EpicCardSkeleton key={`fetch-next-${i}`} />
          ))}
      </div>

      {!isMobile && !loading && epics.length > 0 && (
        <Pagination
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={totalItems}
          hasMore={hasMore}
          itemsShown={epics.length}
          label="projects"
          getVisiblePages={getVisiblePages}
          handlePreviousPage={handlePreviousPage}
          handleNextPage={handleNextPage}
          handlePageClick={handlePageClick}
        />
      )}

      {!loading && epics.length === 0 && !error && (
        <EmptyContent
          className="bg-white border border-[#FFFFFF66] backdrop-blur-xs rounded-4xl"
          image={IMAGES.EpicEmpty}
          title="No epics found."
          description="Break down your large project into manageable epics to track progress better and maintain architectural clarity."
        >
          <Button
            className="flex items-center gap-2 justify-center align-middle"
            onClick={() =>
              router.push(`/dashboard/projects/${projectId}/epics/add`)
            }
          >
            Add New Epic
          </Button>
          <EpicEmptyCards />
        </EmptyContent>
      )}

      {error && (
        <ErrorContent
          title="Something went wrong"
          icon={<ErrorIcon />}
          description="We're having trouble retrieving your project epics right now. Please try again in a moment."
        >
          <Button onClick={() => window.location.reload()}>
            Retry connection
          </Button>
        </ErrorContent>
      )}

      {selectedEpic && (
        <EpicDetailsPopup
          id={selectedEpic?.id}
          epicId={selectedEpic.epic_id}
          projectId={projectId}
          title={selectedEpic?.title}
          description={selectedEpic?.description}
          assigneeName={selectedEpic?.assignee_name}
          createdBy={selectedEpic?.created_by.name}
          deadline={selectedEpic?.deadline}
          isOpen={true}
          onAddTask={() =>
            router.push(
              `/dashboard/projects/${projectId}/tasks/new?epicId=${selectedEpic.id}`,
            )
          }
          onClose={() => handleClosePopup()}
        />
      )}
    </div>
  );
}

function EpicEmptyCards() {
  return (
    <div className="flex flex-wrap gap-3 justify-center sm:justify-between align-middle items-center mt-10 mb-9 sm:mb-0 ">
      {(
        [
          {
            variant: undefined,
            title: "High-Level Goals",
            desc: "Define the broad objectives that span across multiple cycles.",
          },
          {
            variant: "second" as const,
            title: "Hierarchy Design",
            desc: "Link individual tasks to parent epics for a consolidated view.",
          },
          {
            variant: "third" as const,
            title: "Track Velocity",
            desc: "Visualize percentage completion at a macro project level.",
          },
        ] as const
      ).map(({ variant, title, desc }) => (
        <div
          key={title}
          className="bg-[#F1F3FF] rounded-lg flex flex-col justify-start p-5 items-start gap-3 w-52"
        >
          <div className="bg-white rounded-sm p-2 w-10">
            <EmptyEpicContent variant={variant} />
          </div>
          <h4 className="text-[#041B3C] font-semibold text-[16px]">{title}</h4>
          <p className="text-[12px] font-normal text-[#434654] text-left">
            {desc}
          </p>
        </div>
      ))}
    </div>
  );
}
