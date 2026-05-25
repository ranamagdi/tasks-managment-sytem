import  { Suspense } from "react";
import Invite from "./invite-client";


export const metadata = {
  title: "Accept Invitation - Learning management system",
};

export default function InvitePage() {
  return (
    <Suspense fallback={<div />}>
   <Invite/>
    </Suspense>
  );
}
