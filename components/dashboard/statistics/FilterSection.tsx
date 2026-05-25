"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Select, { type StylesConfig, type SingleValue } from "react-select";
import {
  formatRangeLabel,
  getDaysDiff,
  getCurrentWeekRange,
} from "../../../lib/utils/helpers";
import { formatDate } from "../../../lib/utils/dateUtils";
import { getProjects } from "../../../lib/api/projects";
import {
  getTasksCalendarStats,
  getTasksCountPerProject,
} from "../../../lib/api/tasks";
import type {
  Project,
  StatusOption,
  DateRange,
  SelectOption,
  ProjectStatItem,
  CalendarStatsResponse,
} from "../../../types/apiTypes";
import { statusOptions } from "../../../lib/utils/constants";
import Calendar from "./Calander";
import Button from "../../ui/Button";
import StatusOptionLabel from "./StatusOptionLabel";

type FilterSectionProps = {
  onDataFetched: (
    calendar: CalendarStatsResponse,
    projects: ProjectStatItem[],
  ) => void;
};

export default function FilterSection({ onDataFetched }: FilterSectionProps) {
  const MAX_RANGE = 7;

  const [selectedProject, setSelectedProject] = useState<SelectOption>({
    value: "all",
    label: "All Projects",
  });
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>(
    statusOptions[0],
  );
  const [dateRange, setDateRange] = useState<DateRange>(getCurrentWeekRange());
  const [pendingRange, setPendingRange] = useState<DateRange>(
    getCurrentWeekRange(),
  );
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const { data: projectOptions = [{ value: "all", label: "All Projects" }] } =
    useQuery({
      queryKey: ["projects"],
      queryFn: async () => {
        const res = (await getProjects()) as {
          data: Project[];
        };

        const data = res.data;
        return [
          { value: "all", label: "All Projects" },
          ...data.map((p) => ({ value: String(p.id), label: p.name })),
        ];
      },
    });

  const payload =
    dateRange.start && dateRange.end
      ? {
          p_start_date: formatDate(dateRange.start),
          p_end_date: formatDate(dateRange.end),
          p_project_id:
            selectedProject.value === "all" ? null : selectedProject.value,
          p_status:
            selectedStatus.value === "all" ? null : selectedStatus.value,
        }
      : null;

  const { data: statsData } = useQuery({
    queryKey: ["stats", payload],
    queryFn: async () => {
      const [calendar, projects] = await Promise.all([
        getTasksCalendarStats(payload!),
        getTasksCountPerProject({
          p_start_date: payload!.p_start_date,
          p_end_date: payload!.p_end_date,
        }),
      ]);
      return {
        calendar: calendar as CalendarStatsResponse,
        projects: projects as ProjectStatItem[],
      };
    },
    enabled: payload !== null,
  });

  // Notify parent whenever stats arrive
  useEffect(() => {
    if (statsData) {
      onDataFetched(statsData.calendar, statsData.projects);
    }
  }, [statsData, onDataFetched]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setPickerOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);
  // add these functions inside FilterSection

  function changeRangeByDays(direction: "prev" | "next") {
    if (!dateRange.start || !dateRange.end) return;

    const diff = direction === "prev" ? -7 : 7;

    const newStart = new Date(dateRange.start);

    const newEnd = new Date(dateRange.end);

    newStart.setDate(newStart.getDate() + diff);

    newEnd.setDate(newEnd.getDate() + diff);

    // prevent going before today
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (newStart < today) return;

    setDateRange({
      start: newStart,
      end: newEnd,
    });
  }
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const canGoPrev = !!dateRange.start && dateRange.start > new Date();
  function handleDaySelect(date: Date) {
    setRangeError(null);
    if (!pendingRange.start || pendingRange.end) {
      setPendingRange({ start: date, end: null! });
      return;
    }
    let start = pendingRange.start;
    let end = date;
    if (date < start) {
      start = date;
      end = pendingRange.start;
    }
    if (getDaysDiff(start, end) > MAX_RANGE - 1) {
      setRangeError("Maximum range is 7 days");
      return;
    }
    setPendingRange({ start, end });
  }

  function handleApply() {
    if (!pendingRange.start || !pendingRange.end) return;
    setDateRange(pendingRange); // triggers the query automatically
    setPickerOpen(false);
  }

  function handleCancel() {
    setPendingRange(dateRange);
    setPickerOpen(false);
  }

  function openPicker() {
    setPendingRange(dateRange);
    setPickerOpen(true);
  }

  const baseSelectStyles: StylesConfig<SelectOption> = {
    control: (base) => ({
      ...base,
      border: "1.5px solid #e2e8f0",
      borderRadius: 10,
      minHeight: 40,
      boxShadow: "none",
      background: "#fff",
      paddingLeft: 4,
      cursor: "pointer",
      "&:hover": { borderColor: "#94a3b8" },
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? "#eff6ff"
        : state.isFocused
          ? "#f8fafc"
          : "#fff",
      color: "#1e293b",
      fontSize: 14,
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1e293b",
      fontSize: 14,
      fontWeight: 500,
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
    menu: (base) => ({
      ...base,
      borderRadius: 10,
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      border: "1px solid #e2e8f0",
    }),
  };

  const statusSelectStyles: StylesConfig<StatusOption> = {
    control: (base) => ({
      ...base,
      border: "1.5px solid #e2e8f0",
      borderRadius: 10,
      minHeight: 40,
      boxShadow: "none",
      background: "#fff",
      paddingLeft: 6,
      cursor: "pointer",
      "&:hover": { borderColor: "#94a3b8" },
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? "#f8fafc" : "#fff",
      cursor: "pointer",
      padding: "8px 12px",
    }),
    singleValue: (base) => ({ ...base, fontSize: 14 }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
    menu: (base) => ({
      ...base,
      borderRadius: 10,
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      border: "1px solid #e2e8f0",
    }),
  };

  const displayRange: DateRange = pickerOpen ? pendingRange : dateRange;

  return (
    <div className="flex items-center justify-between gap-3 py-3 my-7 flex-wrap bg-(--color-surface-low)">
      <div className="relative" ref={pickerRef}>
        <Button
          variant="text"
          onClick={openPicker}
          className="flex items-center gap-2.5 px-4 h-10 whitespace-nowrap"
        >
          <span
            onClick={(e) => {
              e.stopPropagation();

              if (!canGoPrev) return;

              changeRangeByDays("prev");
            }}
            className={`text-lg leading-none transition ${
              canGoPrev
                ? "text-slate-400 text-lg font-normal leading-none cursor-pointer"
                : "text-slate-400 cursor-not-allowed opacity-30"
            }`}
          >
            ‹
          </span>
          <span className="text-slate-800 font-semibold text-sm">
            {formatRangeLabel(dateRange)}
          </span>

          <span
            onClick={(e) => {
              e.stopPropagation();
              changeRangeByDays("next");
            }}
            className="text-slate-400 text-lg font-normal leading-none cursor-pointer"
          >
            ›
          </span>
        </Button>

        {pickerOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-100 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.13)] border border-slate-200 p-5 min-w-75">
            <Calendar
              range={displayRange}
              onSelect={handleDaySelect}
              onCancel={handleCancel}
              onApply={handleApply}
              error={rangeError}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2.5 mx-2">
        <div className="min-w-auto sm:min-w-45">
          <Select<SelectOption>
            instanceId="project-select"
            options={projectOptions}
            value={selectedProject}
            onChange={(opt) => opt && setSelectedProject(opt)}
            styles={baseSelectStyles}
            isSearchable={false}
          />
        </div>

        <div className="min-w-auto sm:min-w-45">
          <Select<StatusOption>
            instanceId="status-select"
            options={statusOptions}
            value={selectedStatus}
            onChange={(opt: SingleValue<StatusOption>) =>
              opt && setSelectedStatus(opt)
            }
            styles={statusSelectStyles}
            isSearchable={false}
            formatOptionLabel={(option) => (
              <StatusOptionLabel option={option} />
            )}
          />
        </div>
      </div>
    </div>
  );
}
