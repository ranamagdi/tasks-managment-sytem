import  { Suspense } from "react";
import ResetPasswordClient from './reset-password-client'

export const metadata = {
  title: "Reset Password - Learning management system",
};

export default function ResetPassword() {
  return (
    <Suspense fallback={<div />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
