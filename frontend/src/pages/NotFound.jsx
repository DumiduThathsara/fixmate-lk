import { Link } from 'react-router-dom';
import { Home, Wrench } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-md">
        <Wrench className="h-8 w-8" />
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-widest text-blue-700">FixMate LK</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        404 &mdash; Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600 sm:text-base">
        The page you are looking for doesn&apos;t exist or has been moved. Let&apos;s get you back
        on track.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </section>
  );
}
