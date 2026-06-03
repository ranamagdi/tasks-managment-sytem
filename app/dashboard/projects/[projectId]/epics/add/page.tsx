import  { Suspense } from "react";
import EpicAddClient from "./add-client";

export const metadata = {
  title: "Add Epic - Learning management system",
};




export default function Epics() {
  return (
    <Suspense fallback={<div />}>
   <EpicAddClient/>
    </Suspense>
  );
}
