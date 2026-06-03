import { Suspense } from "react";
import CreateTask from "./new-client";

export const metadata = {
  title: "Add Task - Learning management system",
};

export default function TasksAdd() {
  return (
    <Suspense fallback={<div />}>
      <CreateTask />
    </Suspense>
  );
}
