import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Home, Building2, LayoutGrid, Layers, ChevronDown, MapPin } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { supabase } from '../supabase';
import AnimatedPage from '../components/AnimatedPage';

const CITIES    = ['All Cities', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Gurugram', 'Kolkata', 'Pune', 'Delhi'];
const TYPES     = ['All Types', 'Studio', 'Apartment', 'House', 'Duplex'];
const PRICE_OPTIONS = [
  { label: 'Any Price',          min: 0,     max: Infinity },
  { label: 'Under ₹15,000',     min: 0,     max: 14999   },
  { label: '₹15,000 – ₹25,000', min: 15000, max: 25000   },
  { label: '₹25,000 – ₹40,000', min: 25000, max: 40000   },
  { label: 'Above ₹40,000',     min: 40000, max: Infinity },
];

const typeIcons = { Studio: Home, Apartment: Building2, House: LayoutGrid, Duplex: Layers };

const PropertiesSidebar = ({
  city,
  setCity,
  type,
  setType,
  priceIdx,
  setPriceIdx,
  availableOnly,
  setAvailableOnly,
  activeCount,
  resetFilters,
}) => (
  <aside className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-100 dark:border-surface-800 shadow-sm p-6 space-y-7 h-fit sticky top-24">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h2 className="font-bold text-surface-900 text-lg flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5 text-primary-500" /> Filters
      </h2>
      {activeCount > 0 && (
        <button onClick={resetFilters} className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">
          <X className="w-3.5 h-3.5" /> Clear all
        </button>
      )}
    </div>

    {/* City */}
    <div>
      <p className="text-xs uppercase tracking-widest font-bold text-surface-400 mb-3">City</p>
      <div className="flex flex-col gap-1">
        {CITIES.map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`text-left text-sm px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
              city === c ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-600 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>

    {/* Rent Range */}
    <div>
      <p className="text-xs uppercase tracking-widest font-bold text-surface-400 mb-3">Rent Range</p>
      <div className="flex flex-col gap-1">
        {PRICE_OPTIONS.map((opt, i) => (
          <button
            key={opt.label}
            onClick={() => setPriceIdx(i)}
            className={`text-left text-sm px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
              priceIdx === i ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-600 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>

    {/* Property Type */}
    <div>
      <p className="text-xs uppercase tracking-widest font-bold text-surface-400 mb-3">Property Type</p>
      <div className="grid grid-cols-2 gap-2">
        {TYPES.map((t) => {
          const Icon = typeIcons[t];
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-bold transition-all duration-200 ${
                type === t
                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                  : 'border-surface-200 text-surface-600 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {t}
            </button>
          );
        })}
      </div>
    </div>

    {/* Available Only */}
    <div>
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          onClick={() => setAvailableOnly(!availableOnly)}
          className={`w-10 h-5 rounded-full transition-colors duration-300 flex items-center px-0.5 ${
            availableOnly ? 'bg-primary-500' : 'bg-surface-200'
          }`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${availableOnly ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">Available only</span>
      </label>
    </div>
  </aside>
);

const Properties = () => {
  const [searchParams] = useSearchParams();
  const [properties,    setProperties]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState(searchParams.get('search') || '');
  const [city,          setCity]          = useState('All Cities');
  const [type,          setType]          = useState('All Types');
  const [priceIdx,      setPriceIdx]      = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [detecting,     setDetecting]     = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (data) {
        setProperties(data);
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Using Nominatim reverse geocoding (Free)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await res.json();
          // Extract city/town/village
          const cityName = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district;
          
          if (cityName) {
            setCity(cityName);
          } else {
            alert('Could not determine your city.');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
        alert('Could not access your location.');
      }
    );
  };

  const priceRange = PRICE_OPTIONS[priceIdx];

  const filtered = properties ? properties.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch  = p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
    const matchCity    = city  === 'All Cities' || p.city?.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(p.city?.toLowerCase());
    const matchType    = type  === 'All Types'  || p.type  === type;
    const matchPrice   = p.rent >= priceRange.min && p.rent <= priceRange.max;
    const matchAvail   = !availableOnly || p.available;
    return matchSearch && matchCity && matchType && matchPrice && matchAvail;
  }) : [];

  const resetFilters = () => { setCity('All Cities'); setType('All Types'); setPriceIdx(0); setAvailableOnly(false); setSearch(''); };
  const activeCount  = [city !== 'All Cities', type !== 'All Types', priceIdx !== 0, availableOnly].filter(Boolean).length;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-surface-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-surface-900 via-primary-900 to-primary-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">Browse Properties</h1>
          <p className="text-primary-200 text-lg mb-8">Verified rentals across India's top cities</p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl group">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                id="properties-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or location…"
                className="w-full pl-14 pr-4 py-5 rounded-[1.5rem] bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-4 focus:ring-primary-500/20 shadow-2xl shadow-primary-900/40 transition-all border-none text-lg font-medium"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNearMe}
                disabled={detecting}
                className="flex items-center justify-center gap-2 px-6 py-5 bg-white hover:bg-primary-50 text-primary-600 rounded-[1.5rem] font-bold text-base shadow-2xl shadow-primary-900/40 transition-all border-none disabled:opacity-50 whitespace-nowrap"
                title="Detect my current city"
              >
                <MapPin className={`w-5 h-5 ${detecting ? 'animate-bounce' : ''}`} />
                {detecting ? 'Detecting...' : 'Near Me'}
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center justify-center gap-2 px-6 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-[1.5rem] font-bold text-base backdrop-blur-md transition-all md:hidden whitespace-nowrap"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters {activeCount > 0 && <span className="bg-primary-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center -mr-1">{activeCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          {/* Sidebar – desktop always visible, mobile toggled */}
          <div className={`w-64 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
            <PropertiesSidebar
              city={city}
              setCity={setCity}
              type={type}
              setType={setType}
              priceIdx={priceIdx}
              setPriceIdx={setPriceIdx}
              availableOnly={availableOnly}
              setAvailableOnly={setAvailableOnly}
              activeCount={activeCount}
              resetFilters={resetFilters}
            />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results meta bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-surface-600 font-medium">
                <span className="font-bold text-surface-900 text-lg">{filtered.length}</span> listings found
                {city !== 'All Cities' && <span className="text-primary-600"> in {city}</span>}
              </p>
              {activeCount > 0 && (
                <button onClick={resetFilters} className="text-sm text-surface-500 hover:text-red-500 flex items-center gap-1.5 transition-colors">
                  <X className="w-4 h-4" /> Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-surface-100">
                 <div className="text-surface-500 font-medium">Loading properties...</div>
              </div>
            ) : filtered && filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
                {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-surface-100">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-bold text-surface-700 mb-2">No properties found</h3>
                <p className="text-surface-400 mb-6">Try adjusting your search or filters.</p>
                <button onClick={resetFilters} className="btn-primary">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </AnimatedPage>
);
};

export default Properties;
