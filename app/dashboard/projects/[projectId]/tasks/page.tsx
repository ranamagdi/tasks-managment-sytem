import  { Suspense } from "react";
import TasksClient from "./tasks-client";


export const metadata = {
  title: "Tasks - Learning management system",
};

export default function Tasks() {
  return (
    <Suspense fallback={<div />}>
   <TasksClient/>
    </Suspense>
  );
}
