"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useState } from "react";
import { ProTipIcon, OperationProjectIcon } from "@/components/ui/SvgIcons";
import NewMembersPopup from "@/components/dashboard/members/NewMembersPopup";
import { createProject } from "@/lib/api/projects";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import type { ApiError } from "@/types/apiTypes";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import Breadcrumb from "@/components/common/Breadcrumb/Breadcrumb";

const projectSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectsAddClient() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const descriptionValue = useWatch({
    control,
    name: "description",
    defaultValue: "",
  });

  const handleSubmitForm: SubmitHandler<ProjectFormValues> = async (data) => {
    try {
      await createProject({
        name: data.name,
        description: data.description ?? "",
      });

      reset();

      setStatus({
        type: "success",
        message: "Project created successfully",
      });

      setTimeout(() => {
        router.push("/dashboard/projects");
      }, 1500);
    } catch (err: unknown) {
      const error = err as ApiError;
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      setStatus({
        type: "error",
        message: `Failed to create project: ${message}`,
      });
    }
  };

  return (
    <div className="max-w-7xl  px-4 sm:px-6 lg:px-8  ">
      <Breadcrumb />

      <div className="hidden grid-cols-12 items-center md:grid">
        <div className="col-span-12 md:col-span-10 ">
          <h2 className="text-[#041B3C] text-[30px] font-semibold ">
            Add New Project
          </h2>
        </div>
      </div>

      <div
        className="
         flex flex-col
        md:bg-white bg-transparent
        md:shadow-[0px_24px_48px_0px_#041b3c0f] shadow-none
        md:rounded-(--radius-form) rounded-none
        max-w-full md:max-w-xl
        mx-auto
        p-2 md:p-12
      "
      >
        <div className="flex gap-2 items-center">
          <div className="bg-[#0052CC1A] rounded-sm w-14 h-14 items-center justify-center hidden md:flex">
            <OperationProjectIcon />
          </div>
          <div>
            <h3 className="text-[30px] font-(--headline-lg-weight) text-(--color-slate-dark-blue)">
              Initialize New Project
            </h3>
            <p className="text-sm text-(--color-slate-medium-blue) mt-2">
              Define the scope and foundational details of your project.
            </p>
          </div>
        </div>

        {status.type && (
          <div
            className={`relative p-3 pr-10 rounded-sm text-sm border transition-all mt-5 ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {status.message}
            <button
              type="button"
              onClick={() => setStatus({ type: null, message: "" })}
              className="absolute top-2 right-2 text-lg leading-none text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
          </div>
        )}

        <form
          className="flex flex-col items-start pt-10 pb-4 w-full"
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          <div className="mb-5 w-full">
            <label
              className={`
                text-(length:--label-sm-size)
                font-(--label-sm-weight)
                text-(--color-slate-medium-blue)
                uppercase mb-3
                ${errors.name ? "text-(--color-error)" : ""}
              `}
            >
              PROJECT TITLE <span className="error-label"> *</span>
            </label>

            <Input
              type="text"
              placeholder="Project Title"
              isValid={!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="error-message">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-5 w-full">
            <div className="flex items-center justify-between">
              <label
                className={`
                  text-(length:--label-sm-size)
                  font-(--label-sm-weight)
                  text-(--color-slate-medium-blue)
                  uppercase mb-3
                  ${errors.description ? "text-(--color-error)" : ""}
                `}
              >
                DESCRIPTION
              </label>
              <span className="text-[var(--color-slate-medium-blue)99] text-[11px] font-normal">
                Optional
              </span>
            </div>

            <div className="relative">
              <textarea
                placeholder="Provide a high-level overview of the project's architectural objectives and key milestones..."
                rows={5}
                className={`
                  px-4 py-3 pb-8 resize-none
                  w-full rounded-sm outline-none border-none
                  pr-10 pl-4 bg-(--color-surface-highest)
                  ${errors.description ? "bg-(--color-error-field)" : ""}
                `}
                {...register("description")}
              />
              <span className="absolute bottom-3 right-4 text-[var(--color-slate-medium-blue)99] text-[11px] pointer-events-none">
                {(descriptionValue ?? "").length} / 500 characters
              </span>
            </div>

            {errors.description && (
              <p className="error-message">{errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row w-full gap-3 sm:gap-0 sm:items-center">
            <div className="w-full sm:w-1/2 sm:flex sm:justify-start">
              <Button
                className="w-full sm:w-auto"
                type="button"
                variant="text"
                color="var(--color-slate-medium-blue)"
                onClick={() => router.push("/dashboard/projects")}
              >
                Cancel
              </Button>
            </div>

            <div className="w-full sm:w-1/2 sm:flex sm:justify-end">
              <Button
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-(--color-surface-highest) flex justify-between gap-2 p-3 rounded-sm max-w-full md:max-w-xl mx-auto mb-3">
        <ProTipIcon />
        <span className="text-(--color-slate-medium-blue) font-normal text-[12px]">
          <span className="font-bold">Pro Tip:</span> You can invite project
          members and assign epics immediately after the initial creation
          process.
        </span>
      </div>
      {open && <NewMembersPopup onClose={() => setOpen(false)} />}
    </div>
  );
}
