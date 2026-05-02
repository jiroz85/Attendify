import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="p-6">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Not found
      </h2>
      <p className="mt-2 text-sm opacity-80">
        The page you requested does not exist.
      </p>
      <div className="mt-4">
        <Link
          to="/"
          className="text-sm font-medium text-[var(--text-h)] no-underline hover:underline"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
