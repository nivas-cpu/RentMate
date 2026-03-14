import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, User, Users, UserCheck } from 'lucide-react';
import HousemateCard from '../components/HousemateCard';
import { supabase } from '../supabase';
import AnimatedPage from '../components/AnimatedPage';

const CITIES   = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Kolkata', 'Pune'];
const GENDERS  = ['Any', 'Female', 'Male', 'Non-binary', 'Couple'];
const ROOM_TYPES = ['All', 'Private Room', 'Shared Room'];
const BUDGET_OPTIONS = [
  { label: 'Any Budget',         min: 0,     max: Infinity },
  { label: 'Under ₹8,000',      min: 0,     max: 7999    },
  { label: '₹8,000 – ₹12,000',  min: 8000,  max: 12000   },
  { label: '₹12,000 – ₹18,000', min: 12000, max: 18000   },
  { label: 'Above ₹18,000',     min: 18000, max: Infinity },
];

const genderIcon = { Any: Users, Female: User, Male: User, 'Non-binary': UserCheck, Couple: Users };

const HousematesSidebar = ({
  city,
  setCity,
  prefGender,
  setPrefGender,
  roomType,
  setRoomType,
  budgetIdx,
  setBudgetIdx,
  activeCount,
  resetFilters,
}) => (
  <aside className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-100 dark:border-surface-800 shadow-sm p-6 space-y-7 h-fit sticky top-24">
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

    {/* Rent Share */}
    <div>
      <p className="text-xs uppercase tracking-widest font-bold text-surface-400 mb-3">Rent Share</p>
      <div className="flex flex-col gap-1">
        {BUDGET_OPTIONS.map((opt, i) => (
          <button
            key={opt.label}
            onClick={() => setBudgetIdx(i)}
            className={`text-left text-sm px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
              budgetIdx === i ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-600 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>

    {/* Gender Preference */}
    <div>
      <p className="text-xs uppercase tracking-widest font-bold text-surface-400 mb-3">Gender Preference</p>
      <div className="grid grid-cols-2 gap-2">
        {GENDERS.map((g) => {
          const Icon = genderIcon[g] || User;
          return (
            <button
              key={g}
              onClick={() => setPrefGender(g)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-bold transition-all duration-200 ${
                prefGender === g
                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                  : 'border-surface-200 text-surface-600 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {g}
            </button>
          );
        })}
      </div>
    </div>

    {/* Room Type */}
    <div>
      <p className="text-xs uppercase tracking-widest font-bold text-surface-400 mb-3">Room Type</p>
      <div className="flex flex-col gap-1">
        {ROOM_TYPES.map((r) => (
          <button
            key={r}
            onClick={() => setRoomType(r)}
            className={`text-left text-sm px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
              roomType === r ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-600 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            {r === 'All' ? 'All Rooms' : r}
          </button>
        ))}
      </div>
    </div>
  </aside>
);

const Housemates = () => {
  const [housemates,   setHousemates]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [city,         setCity]         = useState('All Cities');
  const [prefGender,   setPrefGender]   = useState('Any');
  const [roomType,     setRoomType]     = useState('All');
  const [budgetIdx,    setBudgetIdx]    = useState(0);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  useEffect(() => {
    const fetchHousemates = async () => {
      setLoading(true);
      const { data } = await supabase.from('housemates').select('*').order('created_at', { ascending: false });
      if (data) {
        setHousemates(data);
      }
      setLoading(false);
    };
    fetchHousemates();
  }, []);

  const budgetRange = BUDGET_OPTIONS[budgetIdx];

  const filtered = housemates ? housemates.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch  = h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q) || h.occupation.toLowerCase().includes(q);
    const matchCity    = city       === 'All Cities' || h.city           === city;
    const matchGender  = prefGender === 'Any'        || h.gender          === prefGender;
    const matchRoom    = roomType   === 'All'         || h.room_type        === roomType;
    const matchBudget  = h.rent_share >= budgetRange.min && h.rent_share <= budgetRange.max;
    return matchSearch && matchCity && matchGender && matchRoom && matchBudget;
  }) : [];

  const resetFilters = () => { setCity('All Cities'); setPrefGender('Any'); setRoomType('All'); setBudgetIdx(0); setSearch(''); };
  const activeCount  = [city !== 'All Cities', prefGender !== 'Any', roomType !== 'All', budgetIdx !== 0].filter(Boolean).length;


  return (
    <AnimatedPage>
      <div className="min-h-screen bg-surface-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 via-surface-900 to-surface-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">Find a Housemate</h1>
          <p className="text-primary-200 text-lg mb-8">Connect with compatible people looking for roommates</p>

          {/* Search bar */}
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                id="housemates-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, or occupation…"
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-lg"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 px-5 py-4 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-2xl font-semibold text-sm backdrop-blur-sm transition-all duration-200 md:hidden"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters {activeCount > 0 && <span className="bg-white text-primary-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className={`w-64 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
            <HousematesSidebar
              city={city}
              setCity={setCity}
              prefGender={prefGender}
              setPrefGender={setPrefGender}
              roomType={roomType}
              setRoomType={setRoomType}
              budgetIdx={budgetIdx}
              setBudgetIdx={setBudgetIdx}
              activeCount={activeCount}
              resetFilters={resetFilters}
            />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-surface-600 font-medium">
                <span className="font-bold text-surface-900 text-lg">{filtered.length}</span> profiles found
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
                 <div className="text-surface-500 font-medium">Loading housemates...</div>
              </div>
            ) : filtered && filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
                {filtered.map((h) => <HousemateCard key={h.id} housemate={h} />)}
              </div>
            ) : (
              <div className="text-center py-24 bg-white dark:bg-surface-900 rounded-3xl border border-surface-100 dark:border-surface-800 shadow-sm">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-surface-700 dark:text-white mb-2">No housemates found</h3>
                <p className="text-surface-400 dark:text-surface-500 mb-6">Try adjusting your search or filters.</p>
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

export default Housemates;
