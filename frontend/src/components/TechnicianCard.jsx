import { Link } from 'react-router-dom';
import { CheckCircle2, MapPin, Star } from 'lucide-react';

export default function TechnicianCard({ technician }) {
  const {
    id,
    name,
    category,
    district,
    rating,
    reviewCount,
    visitFee,
    experienceYears,
    verified,
    avatar,
  } = technician;

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <div className="flex items-start gap-3.5">
          <img
            src={avatar}
            alt={name}
            className="h-14 w-14 shrink-0 rounded-full border border-slate-200 object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-bold text-slate-900">{name}</h3>
              {verified && (
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-blue-600"
                  aria-label="Verified Technician"
                />
              )}
            </div>

            <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {category}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>{district}</span>
          </div>

          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-900">{rating.toFixed(1)}</span>
            <span className="text-xs text-slate-500">({reviewCount} reviews)</span>
          </div>
        </div>

        {experienceYears && (
          <p className="mt-2 text-xs text-slate-500">
            {experienceYears}+ years experience
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-500">Visit Fee</p>
          <p className="text-sm font-bold text-slate-900">
            Rs. {visitFee.toLocaleString()} <span className="font-normal text-slate-500">/ visit</span>
          </p>
        </div>

        <Link
          to={`/technicians/${id}`}
          className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
        >
          View &amp; Book
        </Link>
      </div>
    </article>
  );
}
