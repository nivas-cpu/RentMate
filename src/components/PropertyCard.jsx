import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize2, Star, Heart, ArrowUpRight, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const typeColors = {
  Studio:    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Apartment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  House:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Duplex:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const PropertyCard = ({ property }) => {
  const { id, title, location, rent, bedrooms, bathrooms, area, type, image, available, rating, amenities } = property;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="bg-white dark:bg-surface-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-slate-950/50 transition-all duration-300 group border border-slate-200 dark:border-surface-800/50"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-surface-800">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges top-left */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeColors[type] || 'bg-gray-100 text-gray-700'}`}>
            {type}
          </span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${available ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
            {available ? 'Available' : 'Rented'}
          </span>
        </div>

        {/* Wishlist button top-right */}
        <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm flex items-center justify-center text-surface-500 dark:text-surface-400 hover:text-red-500 hover:bg-white dark:hover:bg-white transition-all duration-200 shadow-sm border border-transparent dark:border-white/10">
          <Heart className="w-4 h-4" />
        </button>

        {/* Rating on hover */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold text-surface-900 dark:text-white">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title & location */}
        <h3 className="font-bold text-surface-900 dark:text-white text-lg leading-tight group-hover:text-primary-600 transition-colors line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 mt-2 text-surface-500 dark:text-surface-400 text-sm">
          <MapPin className="w-4 h-4 text-primary-400 shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-5 text-sm text-surface-600 dark:text-surface-400">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-primary-300 dark:text-primary-500" />
            <span className="font-medium">{bedrooms} Bed</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-surface-200 dark:bg-surface-700" />
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-primary-300 dark:text-primary-500" />
            <span className="font-medium">{bathrooms} Bath</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-surface-200 dark:bg-surface-700" />
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-primary-300 dark:text-primary-500" />
            <span className="font-medium">{area} ft²</span>
          </div>
        </div>

        {/* Amenity chips */}
        {amenities && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {amenities.slice(0, 3).map((a) => (
              <span key={a} className="text-xs bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700 text-surface-600 dark:text-surface-400 px-2.5 py-1 rounded-full">
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-xs bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700 text-surface-400 dark:text-surface-500 px-2.5 py-1 rounded-full">
                +{amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-5 border-t border-surface-100 dark:border-surface-800">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-surface-400 dark:text-surface-500 font-bold mb-0.5">Monthly Rent</p>
            <p className="text-2xl font-black text-primary-600 dark:text-primary-400">
              ₹{rent.toLocaleString()}
            </p>
          </div>
          <Link
            to={`/properties/${id}`}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 group/btn shadow-lg shadow-primary-500/20"
          >
            Details
            <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
