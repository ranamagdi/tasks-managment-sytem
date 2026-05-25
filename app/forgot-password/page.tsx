import  { Suspense } from "react";
import ForgotPasswordPage from "./forgot-password-client";

export const metadata = {
  title: "Forgot Password - Learning management system",
};

export default function ForgotPassword() {
  return (
    <Suspense fallback={<div />}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
