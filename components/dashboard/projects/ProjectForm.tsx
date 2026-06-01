"use client";

import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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

export type ProjectFormValues = z.infer<typeof projectSchema>;

type ProjectFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: SubmitHandler<ProjectFormValues>;
  defaultValues?: ProjectFormValues;
  loading?: boolean;
};

export default function ProjectForm({
  title,
  subtitle,
  submitLabel,
  onSubmit,
  defaultValues,
  loading = false,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const descriptionValue = useWatch({
    control,
    name: "description",
    defaultValue: "",
  });

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p>{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label>PROJECT TITLE *</label>

          <Input
            placeholder="Project Title"
            {...register("name")}
            isValid={!errors.name}
          />

          {errors.name && (
            <p className="error-message">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="mb-5">
          <label>DESCRIPTION</label>

          <textarea
            rows={5}
            className="w-full"
            {...register("description")}
          />

          <span>
            {(descriptionValue ?? "").length}/500
          </span>

          {errors.description && (
            <p className="error-message">
              {errors.description.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </form>
    </div>
  );
}