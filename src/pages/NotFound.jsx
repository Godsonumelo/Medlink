import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <h1 className="heading-1 text-dark mb-4">404</h1>
      <p className="body-large text-gray mb-8">Page not found</p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-[12px] hover:bg-primary-dark transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
