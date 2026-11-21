import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Zap,
} from 'lucide-react';
import Pagination from '../components/Pagination';
import TechnicianCard from '../components/TechnicianCard';
import { SRI_LANKA_DISTRICTS } from '../constants/districts';
import technicianService from '../services/technicianService';

const PAGE_LIMIT = 6;
const DEFAULT_MAX_FEE = 5000;

const RATING_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '4.0+', value: 4.0 },
  { label: '4.5+', value: 4.5 },
];

export default function FindTechnicians() {
  const [searchParams] = useSearchParams();
  const resultsTopRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter & pagination state initialized from URL query params
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(() => searchParams.get('category') || 'All');
  const [district, setDistrict] = useState(() => searchParams.get('district') || 'All');
  const [minRating, setMinRating] = useState(0);
  const [maxFee, setMaxFee] = useState(DEFAULT_MAX_FEE);
  const [urgentOnly, setUrgentOnly] = useState(() => searchParams.get('urgent') === 'true');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [page, setPage] = useState(1);

  // Results state from technicianService
  const [results, setResults] = useState({
    data: [],
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);

  // Sync if URL query parameters change externally (e.g., clicking Footer service links)
  useEffect(() => {
    const paramCategory = searchParams.get('category') || 'All';
    const paramDistrict = searchParams.get('district') || 'All';
    const paramUrgent = searchParams.get('urgent') === 'true';
    setCategory(paramCategory);
    setDistrict(paramDistrict);
    setUrgentOnly(paramUrgent);
    setPage(1);
  }, [searchParams]);

  // Load categories once
  useEffect(() => {
    let active = true;
    technicianService
      .getCategories()
      .then((cats) => {
        if (active) setCategories(cats);
      })
      .catch((err) => console.error('Failed to load categories:', err));
    return () => {
      active = false;
    };
  }, []);

  // Fetch paginated technicians whenever filters, sort, or page change
  useEffect(() => {
    let active = true;
    setLoading(true);

    technicianService
      .searchTechnicians({
        search,
        category,
        district,
        minRating,
        maxFee,
        urgentOnly,
        sortBy,
        page,
        limit: PAGE_LIMIT,
      })
      .then((response) => {
        if (active) {
          setResults(response);
        }
      })
      .catch((err) => {
        console.error('Error searching technicians:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, category, district, minRating, maxFee, urgentOnly, sortBy, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setDistrict('All');
    setMinRating(0);
    setMaxFee(DEFAULT_MAX_FEE);
    setUrgentOnly(false);
    setSortBy('rating_desc');
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startItem = results.totalItems === 0 ? 0 : (results.currentPage - 1) * PAGE_LIMIT + 1;
  const endItem = Math.min(results.currentPage * PAGE_LIMIT, results.totalItems);

  return (
    <div>
      {/* Dark Full-Bleed Page Header Banner */}
      <section className="relative overflow-hidden bg-slate-950 py-12 text-white lg:py-16">
        <img
          src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1920&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/60"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-3 text-xs text-slate-400">
            <Link to="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-200">Find Technicians</span>
          </nav>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Find Verified Technicians
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Browse ID-verified, top-rated home repair professionals across all 25 districts in Sri
            Lanka.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              Background Checked
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              Transparent Visit Fees
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              Instant Online Booking
            </span>
          </div>
        </div>
      </section>

      <div ref={resultsTopRef} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Mobile Filter Toggle */}
        <div className="mb-6 flex justify-end lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Sidebar Filter Panel */}
        <aside
          className={`lg:col-span-3 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}
        >
          <div className="sticky top-24 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Filters</h2>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label htmlFor="filter-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Keyword / Name
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="filter-search"
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g., Kasun, wiring, AC..."
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label htmlFor="filter-category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Service Category
              </label>
              <select
                id="filter-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div>
              <label htmlFor="filter-district" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                District
              </label>
              <select
                id="filter-district"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
              >
                <option value="All">All Districts</option>
                {SRI_LANKA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Minimum Rating
              </span>
              <div className="grid grid-cols-3 gap-2">
                {RATING_OPTIONS.map((option) => {
                  const selected = minRating === option.value;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        setMinRating(option.value);
                        setPage(1);
                      }}
                      className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                        selected
                          ? 'border-blue-700 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {option.value > 0 && (
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      )}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Max Visit Fee Slider */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="filter-max-fee" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Max Visit Fee
                </label>
                <span className="text-xs font-bold text-blue-700">
                  Rs. {maxFee.toLocaleString()}
                </span>
              </div>
              <input
                id="filter-max-fee"
                type="range"
                min={1000}
                max={5000}
                step={250}
                value={maxFee}
                onChange={(e) => {
                  setMaxFee(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-blue-700"
              />
              <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                <span>Rs. 1,000</span>
                <span>Rs. 5,000</span>
              </div>
            </div>

            {/* Emergency Dispatch Toggle */}
            <div className="border-t border-slate-100 pt-4">
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50/70 p-3">
                <span className="flex items-center gap-2 text-xs font-semibold text-red-800">
                  <Zap className="h-4 w-4 text-red-600" />
                  Emergency Dispatch (Within 2 Hrs)
                </span>
                <input
                  type="checkbox"
                  checked={urgentOnly}
                  onChange={(e) => {
                    setUrgentOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-600"
                />
              </label>
            </div>
          </div>
        </aside>

        {/* Main Results Area */}
        <div className="lg:col-span-9">
          {/* Results Header */}
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center">
            <p className="text-sm text-slate-600">
              {results.totalItems > 0 ? (
                <>
                  Showing{' '}
                  <span className="font-semibold text-slate-900">
                    {startItem}&ndash;{endItem}
                  </span>{' '}
                  of <span className="font-semibold text-slate-900">{results.totalItems}</span>{' '}
                  technicians
                </>
              ) : (
                'Showing 0 technicians'
              )}
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sort By
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
              >
                <option value="rating_desc">Top Rated</option>
                <option value="fee_asc">Lowest Visit Fee</option>
                <option value="fee_desc">Highest Visit Fee</option>
                <option value="experience_desc">Most Experienced</option>
              </select>
            </div>
          </div>

          {/* Results Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                />
              ))}
            </div>
          ) : results.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <Search className="h-10 w-10 text-slate-300" />
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No technicians match your filters
              </h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Try adjusting your search keywords, district, or maximum visit fee to see more
                available technicians.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {results.data.map((tech) => (
                  <TechnicianCard key={tech.id} technician={tech} />
                ))}
              </div>

              <Pagination
                currentPage={results.currentPage}
                totalPages={results.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
