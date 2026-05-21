import AuthCallback from "@/components/auth/AuthCallBack";

export const metadata = {
  title: "Learning management system",
};
export default function Home() {
  return (
    <div >
      <AuthCallback />
    </div>
  );
}
