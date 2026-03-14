import { useState } from 'react';
import { MapPin, Wallet, DoorOpen, Users, Phone, Calendar, X } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const genderBadge = {
  Female: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Male: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Non-binary': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Couple: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Any: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

const roomTypeBadge = {
  'Private Room': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Shared Room': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const HousemateCard = ({ housemate }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const {
    name,
    age,
    occupation,
    rent_share,
    city,
    avatar,
    interests,
    gender,
    preferred_gender,
    room_type,
    move_in,
    bio,
    location,
  } = housemate;

  const openModal = () => {
    if (!user) {
      alert("Please log in to contact users.");
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
    
    const receiverId = housemate.user_id || '00000000-0000-0000-0000-000000000000';

    const { error: submitError } = await supabase.from('messages').insert([
      {
        sender_id: user.id,
        sender_name: user?.user_metadata?.full_name || user?.email,
        receiver_id: receiverId,
        subject: `Interested in teaming up: ${name}`,
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
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8 }}
        className="bg-white dark:bg-surface-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-slate-950/50 transition-all duration-300 group border border-slate-200 dark:border-surface-800/50"
      >
        {/* Coloured header strip */}
        <div className="h-16 bg-gradient-to-br from-primary-600 to-indigo-700 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[size:12px_12px]" />
        </div>

        <div className="px-6 pt-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between mb-4">
            <motion.img
              whileHover={{ scale: 1.1, rotate: 2 }}
              src={avatar}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-surface-800 shadow-lg transition-transform duration-300 -mt-12 relative z-10"
            />
            <div className="flex flex-col items-end gap-1.5 pb-1">
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  genderBadge[preferred_gender] || 'bg-gray-100 text-gray-600'
                }`}
              >
                Prefers {preferred_gender}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  roomTypeBadge[room_type] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {room_type}
              </span>
            </div>
          </div>

          {/* Name & Occupation */}
          <h3 className="font-extrabold text-surface-900 dark:text-white text-xl leading-tight cursor-default select-none">
            {name}, <span className="text-surface-400 font-semibold text-base">{age}</span>
          </h3>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-0.5 cursor-default select-none">{occupation}</p>

          {/* Bio */}
          <p className="text-surface-600 dark:text-surface-300 text-sm mt-4 italic line-clamp-2 leading-relaxed border-l-2 border-primary-200 dark:border-primary-800 pl-3">
            {bio}
          </p>

          {/* Key details grid */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              { label: 'City', value: city, icon: MapPin, color: 'primary' },
              { label: 'Area', value: location, icon: MapPin, color: 'orange' },
              { label: 'Rent', value: `₹${rent_share?.toLocaleString()}`, icon: Wallet, color: 'green' },
              { label: 'Gender', value: gender, icon: Users, color: 'violet' }
            ].filter(d => d.value).map((detail, idx) => (
              <div key={idx} className="bg-surface-50 dark:bg-surface-800/50 rounded-2xl p-3 flex items-center gap-2.5 border border-transparent dark:border-surface-700/30">
                <div className={`w-8 h-8 rounded-xl bg-${detail.color}-100 dark:bg-${detail.color}-900/30 flex items-center justify-center`}>
                  <detail.icon className={`w-4 h-4 text-${detail.color}-600 dark:text-${detail.color}-400`} />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-surface-400 dark:text-surface-500 font-bold leading-none mb-1">{detail.label}</p>
                  <p className="text-xs font-bold text-surface-800 dark:text-surface-200 leading-tight truncate">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interests */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {interests?.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[10px] font-bold uppercase tracking-wider bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-full border border-primary-100 dark:border-primary-800/50"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Move-in & CTA */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-surface-100 dark:border-surface-800 gap-3">
            <div className="flex items-center gap-1.5 text-surface-500 dark:text-surface-400 text-xs">
              <Calendar className="w-3.5 h-3.5 text-primary-400 dark:text-primary-500" />
              Move in: <span className="font-semibold text-surface-700 dark:text-surface-200">{move_in}</span>
            </div>
            <button
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/20"
              onClick={openModal}
            >
              <Phone className="w-4 h-4" />
              Contact
            </button>
          </div>
        </div>
      </motion.div>

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
                  <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Contact {name}</h2>
                  <p className="text-surface-500 dark:text-surface-400 mt-1">Send a message to your potential housemate</p>
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
                    <p className="text-sm opacity-90">We'll notify {name} and follow up when they respond.</p>
                  </motion.div>
                ) : (
                  <>
                    <label className="block text-sm font-bold text-surface-700 dark:text-surface-300 mb-2" htmlFor="message">
                      Your message
                    </label>
                    <textarea
                      id="message"
                      className="w-full rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 p-4 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Hi ${name}, I'm interested in learning more about your room...`}
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
    </>
  );
};

export default HousemateCard;
