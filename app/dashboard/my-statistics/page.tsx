import  { Suspense } from "react";
import MyStatisticsPage from "./my-statistics-client";


export const metadata = {
  title: "My Statistics - Learning management system",
};

export default function MyStatistics() {
  return (
    <Suspense fallback={<div />}>
   <MyStatisticsPage/>
    </Suspense>
  );
}
