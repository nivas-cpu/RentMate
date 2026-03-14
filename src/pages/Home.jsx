import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import HousemateCard from '../components/HousemateCard';
import { supabase } from '../supabase';
import { useEffect, useState } from 'react';
import AnimatedPage from '../components/AnimatedPage';

const stats = [
  { label: 'Active Listings', value: '0' },
  { label: 'Cities Covered', value: '15' },
  { label: 'Happy Renters', value: '0' },
  { label: 'Housemate Matches', value: '0' },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [properties, setProperties] = useState([]);
  const [housemates, setHousemates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const [propsRes, matesRes] = await Promise.all([
        supabase.from('properties').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('housemates').select('*').order('created_at', { ascending: false }).limit(3)
      ]);

      if (propsRes.data) setProperties(propsRes.data);
      if (matesRes.data) setHousemates(matesRes.data);
      
      setLoading(false);
    };

    fetchListings();
  }, []);

  return (
    <AnimatedPage>
      <div>
        {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-sky-900 via-indigo-900 to-primary-800 min-h-[92vh] flex items-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[540px] h-[540px] bg-sky-400/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-emerald-300/12 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-white/20 border border-white/25 text-sky-100 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Trusted by tenants in 15 cities
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
              Discover homes that feel like home.
            </h1>

            <p className="text-sky-100 text-base sm:text-lg mt-5 max-w-2xl leading-relaxed">
              Find curated rentals and friendly housemates with transparent listings, real reviews, and quick local support.
            </p>

            {/* Search Bar */}
            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto] bg-white/90 border border-white/30 p-3 rounded-3xl shadow-lg">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  id="hero-search"
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(searchValue.trim() ? `/properties?search=${encodeURIComponent(searchValue.trim())}` : '/properties');
                    }
                  }}
                  placeholder="Search city, neighborhood, or budget"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <button onClick={() => {
                if (searchValue.trim()) {
                  navigate(`/properties?search=${encodeURIComponent(searchValue.trim())}`);
                } else {
                  navigate('/properties');
                }
              }} className="btn-primary text-sm sm:text-base px-5 py-3.5">
                Search Homes
              </button>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad'].map((city) => (
                <Link
                  key={city}
                  to="/properties"
                  className="text-xs sm:text-sm text-slate-100 bg-white/20 hover:bg-white/30 border border-white/20 px-3 py-1.5 rounded-full transition-all"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-white border-b border-surface-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-surface-200 bg-gradient-to-br from-slate-50 to-white p-4 text-center shadow-sm">
                <div className="text-3xl font-extrabold text-primary-600">{stat.value}</div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="section-title">Featured Properties</h2>
              <p className="section-subtitle">Hand-picked listings just for you</p>
            </div>
            <Link to="/properties" className="btn-outline self-start sm:self-auto">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-20 text-surface-500">Loading latest properties...</div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.slice(0, 3).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <p className="text-surface-500">No featured properties available at the moment.</p>
          )}
        </div>
      </section>

      {/* ── Find a Housemate ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="section-title">Find a Housemate</h2>
              <p className="section-subtitle">Connect with compatible people near you</p>
            </div>
            <Link to="/housemates" className="btn-outline self-start sm:self-auto">
              View All →
            </Link>
          </div>
          {loading ? (
             <div className="text-center py-20 text-surface-500">Loading housemate profiles...</div>
          ) : housemates && housemates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {housemates.slice(0, 3).map((h) => (
                <HousemateCard key={h.id} housemate={h} />
              ))}
            </div>
          ) : (
            <p className="text-surface-500">No housemates looking for rooms right now.</p>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Are You a Property Owner?
          </h2>
          <p className="text-primary-200 text-lg mb-8">
            List your property for free and reach thousands of verified renters today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-all duration-200 hover:scale-105">
              List Your Property
            </Link>
            <Link to="/properties" className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all duration-200">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  </AnimatedPage>
);
};

export default Home;
