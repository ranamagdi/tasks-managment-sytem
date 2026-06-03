import  { Suspense } from "react";
import EpicClient from "./epics-client";


export const metadata = {
  title: "Epics - Learning management system",
};

export default function Epics() {
  return (
    <Suspense fallback={<div />}>
   <EpicClient/>
    </Suspense>
  );
}
