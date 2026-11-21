import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Hammer,
  MapPin,
  Paintbrush,
  Search,
  Settings,
  ShieldCheck,
  Snowflake,
  Wrench,
  Zap,
} from 'lucide-react';
import TechnicianCard from '../components/TechnicianCard';
import { SRI_LANKA_DISTRICTS } from '../constants/districts';
import technicianService from '../services/technicianService';

const ICON_MAP = {
  Wrench,
  Zap,
  Snowflake,
  Hammer,
  Paintbrush,
  Settings,
};

const HOW_IT_WORKS_STEPS = [
  {
    step: '1',
    title: 'Search by Skill & District',
    description:
      'Choose the repair category you need and filter verified technicians in your Sri Lankan district.',
    icon: Search,
  },
  {
    step: '2',
    title: 'Compare & Book',
    description:
      'Review transparent visit fees, customer ratings, and availability before confirming a slot.',
    icon: CalendarCheck,
  },
  {
    step: '3',
    title: 'Get It Fixed',
    description:
      'Your verified technician arrives on time to complete the job safely and professionally.',
    icon: ShieldCheck,
  },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredTechnicians, setFeaturedTechnicians] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadHomeData() {
      try {
        const [cats, techs] = await Promise.all([
          technicianService.getCategories(),
          technicianService.getFeaturedTechnicians(4),
        ]);
        if (active) {
          setCategories(cats);
          setFeaturedTechnicians(techs);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      }
    }

    loadHomeData();
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedDistrict) params.set('district', selectedDistrict);
    const queryString = params.toString();
    navigate(queryString ? `/technicians?${queryString}` : '/technicians');
  };

  return (
    <div>
      {/* Hero Section: Full-Bleed Dark Overlay Background Banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Full-Width Background Image */}
        <img
          src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1920&q=80"
          alt="Technician working on home electrical and repair equipment"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Directional Left-to-Right Dark Gradient Overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-900/35"
        />

        {/* Left-Aligned Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl text-left">
            <span className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-200">
              Sri Lanka&apos;s #1 On-Demand Technician Network
            </span>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Reliable &amp; Trusted Technicians in Sri Lanka
            </h1>

            <p className="mb-8 mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
              Book verified plumbers, electricians, AC technicians, and home repair experts across
              all 25 districts with upfront pricing.
            </p>

            {/* Left-Aligned Search Bar */}
            <form
              onSubmit={handleSearch}
              className="max-w-2xl rounded-xl bg-white p-2 shadow-2xl"
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <div className="relative sm:col-span-5">
                  <label htmlFor="hero-category" className="sr-only">
                    Service Category
                  </label>
                  <Wrench className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    id="hero-category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 focus:border-blue-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                  >
                    <option value="">All Service Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative sm:col-span-4">
                  <label htmlFor="hero-district" className="sr-only">
                    District
                  </label>
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    id="hero-district"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 focus:border-blue-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                  >
                    <option value="">All 25 Districts</option>
                    {SRI_LANKA_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition-colors hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                  >
                    <Search className="h-4 w-4" />
                    Find Technician
                  </button>
                </div>
              </div>
            </form>

            {/* Trust Indicators Row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-300 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                100% ID Verified Pros
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                Upfront LKR Pricing
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                All 25 Districts Covered
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Popular Services
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Select a category to browse verified specialists near you.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const IconComponent = ICON_MAP[category.iconName] || Wrench;
            return (
              <Link
                key={category.id}
                to={`/technicians?category=${encodeURIComponent(category.name)}`}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-700 group-hover:text-white">
                  <IconComponent className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {category.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Top-Rated Technicians Section */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Featured Top-Rated Technicians
              </h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Highly rated professionals trusted by homeowners across Sri Lanka.
              </p>
            </div>
            <Link
              to="/technicians"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              View All Technicians
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTechnicians.map((tech) => (
              <TechnicianCard key={tech.id} technician={tech} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How FixMate LK Works
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Book a reliable technician in three simple steps.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((item) => {
            const StepIcon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white">
                  <StepIcon className="h-5 w-5" />
                </div>
                <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-blue-700">
                  Step {item.step}
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technician CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-slate-900 px-6 py-10 text-white shadow-lg sm:px-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Are You a Skilled Technician?
            </h2>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              Join FixMate LK to connect with customers in your district, manage your bookings, and
              grow your service business.
            </p>
          </div>
          <Link
            to="/auth"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-sm transition-colors hover:bg-amber-400"
          >
            Join as a Technician
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
