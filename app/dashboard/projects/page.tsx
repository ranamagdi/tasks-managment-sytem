import  { Suspense } from "react";
import ProjectsPage from "./projects-client";

export const metadata = {
  title: "Projects - Learning management system",
};

export default function Projects() {
  return (
    <Suspense fallback={<div />}>
      <ProjectsPage />
    </Suspense>
  );
}
