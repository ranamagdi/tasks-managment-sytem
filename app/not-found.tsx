
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div
        className="
          flex flex-col items-center
          bg-white shadow-[0px_24px_48px_0px_#041b3c0f]
          rounded-(--radius-form)
          max-w-xl w-full mx-auto px-12 py-16
          max-md:bg-transparent max-md:shadow-none max-md:rounded-none
          max-md:px-6 max-md:py-8
        "
      >
        <h1
          className="
            text-[96px] font-(--headline-lg-weight)
            text-(--color-primary) leading-none tracking-tight
          "
        >
          404
        </h1>

        <h3
          className="
            text-center text-[30px] font-(--headline-lg-weight)
            text-(--color-slate-dark-blue) leading-9 mt-4
          "
        >
          Page Not Found
        </h3>

        <p
          className="
            text-center text-(length:--body-md-size)
            font-(--body-md-weight) text-(--color-slate-medium-blue)
            leading-5 mt-3 max-w-sm
          "
        >
          Oops! The page you are looking for does not exist or has been moved.
        </p>

        <div className="w-16 h-1 bg-(--color-primary) rounded-full mt-8 mb-8 opacity-20" />

        <Link
          href="/dashboard"
          className="
            px-8 py-2.5 rounded-(--radius-form)
            bg-(--color-primary) text-white
            text-(length:--body-md-size) font-(--headline-lg-weight)
          "
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}