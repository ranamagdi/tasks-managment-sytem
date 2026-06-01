import { Suspense } from "react";
import ProjectsEditClient from "./projects-edit-client";

export const metadata = {
  title: "Edit Project - Learning management system",
};

export default function EditProjectPage() {
  return (
    <Suspense fallback={<div />}>
      <ProjectsEditClient />
    </Suspense>
  );
}
