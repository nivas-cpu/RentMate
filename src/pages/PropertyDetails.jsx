import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Bath, Maximize2, Star, Heart, X, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// // Fix for default marker icon being broken in many build setups
// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// 
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//     iconRetinaUrl: markerIcon2x,
//     iconUrl: markerIcon,
//     shadowUrl: markerShadow,
// });

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      const { data } = await supabase.from('properties').select('*').eq('id', id).single();
      if (data) setProperty(data);
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 text-surface-900">
        <div className="text-surface-500 font-medium text-lg flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          Loading property details...
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
          <h1 className="text-2xl font-bold mb-4 text-surface-900">Property not found</h1>
          <p className="text-surface-600 mb-6 font-medium">The listing you are looking for doesn&rsquo;t exist.</p>
          <Link to="/properties" className="btn-primary">
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const { title, location, rent, bedrooms, bathrooms, area, type, image, images, available, rating, amenities, latitude, longitude } = property;
  const [activeImage, setActiveImage] = useState(0);
  const gallery = images && images.length > 0 ? images : [image];

  const openModal = () => {
    if (!user) {
      alert("Please log in to contact the owner.");
      return;
    }
    setIsModalOpen(true);
    setSent(false);
    setMessage('');
    setError(null);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    
    const receiverId = property.owner_id;

    const { error: submitError } = await supabase.from('messages').insert([
      {
        sender_id: user.id,
        sender_name: user?.user_metadata?.full_name || user?.email,
        receiver_id: receiverId,
        subject: `Inquiry about: ${title}`,
        content: message
      }
    ]);

    setSending(false);

    if (submitError) {
      setError(submitError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-surface-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 mb-6 text-primary-600 hover:text-primary-700 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary-900/10 border border-white h-[500px]">
                <img 
                  src={activeImage < gallery.length ? gallery[activeImage] : gallery[0]} 
                  alt={title} 
                  className="w-full h-full object-cover transition-all duration-700" 
                />
              </div>
              
              {gallery.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === idx ? 'border-primary-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`thumbnail ${idx}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-surface-900 rounded-[2.5rem] shadow-xl shadow-surface-200/50 dark:shadow-surface-950/50 p-10 mt-8 border border-surface-100 dark:border-surface-800 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-surface-900 dark:text-white leading-tight">{title}</h1>
                  <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400 mt-3 font-medium">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    <span className="text-lg">{location}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right bg-primary-50 dark:bg-primary-900/20 px-6 py-4 rounded-3xl border border-primary-100 dark:border-primary-800/50">
                  <div className="text-xs text-primary-600 dark:text-primary-400 uppercase tracking-widest font-black mb-1">Monthly Rent</div>
                  <div className="text-4xl font-black text-primary-700 dark:text-primary-300">₹{rent.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-50 dark:bg-surface-800/50 rounded-[1.5rem] p-5 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-surface-800 hover:shadow-md transition-all duration-300 border border-transparent hover:border-surface-200 dark:hover:border-surface-700">
                  <Bed className="w-6 h-6 text-primary-500" />
                  <div className="text-center">
                    <div className="text-xs text-surface-400 dark:text-surface-500 font-bold uppercase tracking-wider">Bedrooms</div>
                    <div className="font-extrabold text-surface-900 dark:text-white text-lg">{bedrooms}</div>
                  </div>
                </div>
                <div className="bg-surface-50 dark:bg-surface-800/50 rounded-[1.5rem] p-5 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-surface-800 hover:shadow-md transition-all duration-300 border border-transparent hover:border-surface-200 dark:hover:border-surface-700">
                  <Bath className="w-6 h-6 text-primary-500" />
                  <div className="text-center">
                    <div className="text-xs text-surface-400 dark:text-surface-500 font-bold uppercase tracking-wider">Bathrooms</div>
                    <div className="font-extrabold text-surface-900 dark:text-white text-lg">{bathrooms}</div>
                  </div>
                </div>
                <div className="bg-surface-50 dark:bg-surface-800/50 rounded-[1.5rem] p-5 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-surface-800 hover:shadow-md transition-all duration-300 border border-transparent hover:border-surface-200 dark:hover:border-surface-700">
                  <Maximize2 className="w-6 h-6 text-primary-500" />
                  <div className="text-center">
                    <div className="text-xs text-surface-400 dark:text-surface-500 font-bold uppercase tracking-wider">Total Area</div>
                    <div className="font-extrabold text-surface-900 dark:text-white text-lg">{area} ft²</div>
                  </div>
                </div>
                <div className="bg-surface-50 dark:bg-surface-800/50 rounded-[1.5rem] p-5 flex flex-col items-center gap-2 hover:bg-white dark:hover:bg-surface-800 hover:shadow-md transition-all duration-300 border border-transparent hover:border-surface-200 dark:hover:border-surface-700">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <div className="text-center">
                    <div className="text-xs text-surface-400 dark:text-surface-500 font-bold uppercase tracking-wider">Rating</div>
                    <div className="font-extrabold text-surface-900 dark:text-white text-lg">{rating || 4.5}</div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h2 className="text-2xl font-black text-surface-900 dark:text-white mb-5 flex items-center gap-3">
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-3">
                  {amenities?.map((amenity) => (
                    <span key={amenity} className="text-sm font-bold bg-white dark:bg-surface-800 shadow-sm border border-surface-200 dark:border-surface-700 rounded-2xl px-5 py-2.5 text-surface-700 dark:text-surface-300 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-700 transition-all cursor-default">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Leaflet Map Section */}
              <div className="mt-12">
                <h2 className="text-2xl font-black text-surface-900 dark:text-white mb-5">Location</h2>
                <div className="rounded-[2rem] overflow-hidden h-80 border border-surface-200 dark:border-surface-800 shadow-inner bg-surface-100 dark:bg-slate-950 relative z-10">
                  {(latitude && longitude) ? (
                    <MapContainer 
                      center={[parseFloat(latitude), parseFloat(longitude)]} 
                      zoom={15} 
                      scrollWheelZoom={false} 
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[parseFloat(latitude), parseFloat(longitude)]}>
                        <Popup>
                          {title}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <MapPin className="w-12 h-12 text-surface-300 mb-3" />
                      <p className="text-surface-500 font-bold">Map unavailable</p>
                      <p className="text-surface-400 text-sm mt-1">Exact location coordinates haven't been added for this listing yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-surface-100 flex flex-col sm:flex-row gap-4">
                <button className="btn-primary w-full py-4 text-lg font-black" onClick={openModal}>Contact Owner</button>
                <button className="btn-outline w-full py-4 text-lg font-black border-2 border-primary-100 hover:bg-primary-50">Save Listing</button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-lg p-6 border border-slate-200 dark:border-surface-800">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-3">About this home</h3>
              <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
                This property is a beautiful {(type || 'home').toLowerCase()} located in one of the most desirable neighborhoods.
                It offers modern amenities and is perfect for those looking for a comfortable, stylish space.
              </p>
            </div>

            <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-lg p-6 border border-slate-200 dark:border-surface-800">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-3">Need help?</h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">Have questions about the listing? Reach out and we&apos;ll connect you with the owner.</p>
              <button className="btn-primary w-full" onClick={openModal}>Send a message</button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-surface-900 p-8 shadow-2xl relative z-10 border border-slate-200 dark:border-surface-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Contact Owner</h2>
                  <p className="text-surface-500 dark:text-surface-400 mt-1">Inquire about {title}</p>
                </div>
                <button
                  className="rounded-xl p-2.5 text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  onClick={closeModal}
                  aria-label="Close contact dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-8">
                {sent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-6 text-emerald-900 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50"
                  >
                    <p className="font-bold text-lg mb-1">Message sent! 🚀</p>
                    <p className="text-sm opacity-90">We'll notify the owner and follow up when they respond.</p>
                  </motion.div>
                ) : (
                  <>
                    <label className="block text-sm font-bold text-surface-700 dark:text-surface-300 mb-2" htmlFor="message">
                      Your message
                    </label>
                    <textarea
                      id="message"
                      className="w-full rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 p-4 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Hi, I'm interested in viewing ${title}...`}
                    />

                    {error && <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-2">{error}</p>}

                    <div className="mt-6 flex gap-3 justify-end">
                      <button
                        className="rounded-xl px-6 py-2.5 text-sm font-bold text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                        onClick={closeModal}
                        disabled={sending}
                      >
                        Cancel
                      </button>
                      <button
                        className="rounded-xl bg-primary-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 disabled:opacity-50 transition-all"
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                      >
                        {sending ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </AnimatedPage>
  );
};

export default PropertyDetails;
