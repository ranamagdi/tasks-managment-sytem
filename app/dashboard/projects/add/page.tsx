import  { Suspense } from "react";
import ProjectsAddClient from "./projects-add-client";


export const metadata = {
  title: "Add New Projects - Learning management system",
};

export default function CreateProjectPage() {
  return (
    <Suspense fallback={<div />}>
      <ProjectsAddClient />
    </Suspense>
  );
}
