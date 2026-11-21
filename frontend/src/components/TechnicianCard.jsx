import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MapPin, Star } from 'lucide-react';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function TechnicianCard({ technician }) {
  const [imgError, setImgError] = useState(false);

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
    available = true,
    avatar,
    distanceKm,
    isBestMatch,
  } = technician;

  return (
    <article className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
      <div>
        {isBestMatch && (
          <span className="mb-3 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
            &#9733; Best Match
          </span>
        )}
        <div className="flex items-start gap-3.5">
          {avatar && !imgError ? (
            <img
              src={avatar}
              alt={name}
              onError={() => setImgError(true)}
              className="h-14 w-14 shrink-0 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
              {getInitials(name)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <h3
                  title={name}
                  className="line-clamp-1 text-base font-bold text-slate-900"
                >
                  {name}
                </h3>
                {verified && (
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-blue-600"
                    aria-label="Verified Technician"
                  />
                )}
              </div>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {category}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  available ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    available ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                {available ? 'Available' : 'Busy'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>
              {district}
              {distanceKm ? ` • ${distanceKm} km away` : ''}
            </span>
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
