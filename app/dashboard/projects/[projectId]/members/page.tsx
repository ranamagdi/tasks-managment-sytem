import { Suspense } from "react";
import Members from "./members-client";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `Project members ${projectId} - Learning management system`,
  };
}

export default function EditProjectPage() {
  return (
    <Suspense fallback={<div />}>
      <Members />
    </Suspense>
  );
}