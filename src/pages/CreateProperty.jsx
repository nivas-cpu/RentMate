import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../supabase';
import { Building2, Home, Upload, Loader2, MapPin, Search } from 'lucide-react';

const CreateProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: '',
    location: '',
    city: '',
    rent: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'Apartment',
    image: '',
    amenities: '',
    latitude: null,
    longitude: null
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <button className="btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  const handleLocationSearch = async (query) => {
    setForm({ ...form, location: query });
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      // Using OpenStreetMap Nominatim API (Free, no key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
          }
        }
      );
      const data = await response.json();
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const selectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    
    // Extract city from display_name or address if available
    const displayNameParts = item.display_name.split(', ');
    const city = displayNameParts[displayNameParts.length - 3] || displayNameParts[0];
    
    setForm({
      ...form,
      location: item.display_name,
      city: city,
      longitude: lon,
      latitude: lat
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
  };

  const uploadImages = async () => {
    const urls = [];
    for (const file of uploadFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('property-images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      urls.push(publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrls = [];
      if (uploadFiles.length > 0) {
        setUploading(true);
        imageUrls = await uploadImages();
        setUploading(false);
      }

      // Convert amenities comma string to array
      const amenitiesArray = form.amenities.split(',').map(a => a.trim()).filter(Boolean);
      const mainImage = imageUrls[0] || form.image.trim() || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60';

      const { error: insertError } = await supabase.from('properties').insert([
        {
          owner_id: user.id,
          title: form.title,
          location: form.location,
          city: form.city,
          rent: parseInt(form.rent) || 0,
          bedrooms: parseInt(form.bedrooms) || 1,
          bathrooms: parseFloat(form.bathrooms) || 1,
          area: parseInt(form.area) || 0,
          type: form.type,
          image: mainImage,
          images: imageUrls,
          amenities: amenitiesArray,
          latitude: form.latitude,
          longitude: form.longitude
        }
      ]);

      if (insertError) throw insertError;
      navigate('/properties');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-primary-600 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="w-8 h-8" /> List a Property
            </h1>
            <p className="mt-2 text-primary-100">Find the perfect tenant by listing your home on RentMate.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Listing Title</label>
                <input required type="text" name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="e.g. Beautiful Sea View Apartment" />
              </div>

              <div className="md:col-span-2 relative">
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Search Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
                  <input 
                    required 
                    type="text" 
                    name="location" 
                    value={form.location} 
                    onChange={(e) => handleLocationSearch(e.target.value)} 
                    onFocus={() => setShowSuggestions(true)}
                    className="input-field pl-12" 
                    placeholder="Enter full address or building name..." 
                    autoComplete="off"
                  />
                </div>
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-surface-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        type="button"
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-5 py-4 hover:bg-primary-50 transition-colors border-b last:border-0 border-surface-100 flex items-start gap-4"
                      >
                        <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-surface-900 leading-tight mb-0.5">{suggestion.display_name.split(',')[0]}</p>
                          <p className="text-xs text-surface-500 line-clamp-2">{suggestion.display_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Landmark / House No.</label>
                  <input type="text" name="landmark" className="input-field" placeholder="e.g. Near HDFC Bank, Flat 402" />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">City</label>
                  <input readOnly type="text" name="city" value={form.city} className="input-field bg-surface-50 text-surface-500" placeholder="Mumbai" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Monthly Rent (₹)</label>
                <input required type="number" name="rent" value={form.rent} onChange={handleChange} className="input-field" placeholder="25000" min="0" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Property Type</label>
                <select name="type" value={form.type} onChange={handleChange} className="input-field">
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Studio">Studio</option>
                  <option value="Duplex">Duplex</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Bedrooms</label>
                <input required type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} className="input-field" min="1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Bathrooms</label>
                <input required type="number" step="0.5" name="bathrooms" value={form.bathrooms} onChange={handleChange} className="input-field" min="1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Carpet Area (sq ft)</label>
                <input required type="number" name="area" value={form.area} onChange={handleChange} className="input-field" placeholder="1200" min="0" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Amenities (comma separated)</label>
                <input type="text" name="amenities" value={form.amenities} onChange={handleChange} className="input-field" placeholder="e.g. Gym, Pool, Parking, WiFi" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-2">Property Photos</label>
                <div className="flex flex-col gap-4">
                  <div className="relative group border-2 border-dashed border-surface-200 hover:border-primary-400 rounded-2xl p-8 transition-all bg-surface-50 hover:bg-primary-50/30 flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform mb-3">
                      <Upload className="w-6 h-6 text-primary-500" />
                    </div>
                    <p className="text-sm font-bold text-surface-900">Click to upload photos</p>
                    <p className="text-xs text-surface-500 mt-1">PNG, JPG or WebP (Max 5MB each)</p>
                  </div>

                  {uploadFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {uploadFiles.map((file, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-surface-100">
                          <img
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                            alt="preview"
                          />
                          <div className="absolute inset-0 bg-black/10" />
                        </div>
                      ))}
                      <div className="flex items-center text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full h-fit mt-auto mb-2">
                        {uploadFiles.length} files selected
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="flex items-center gap-3 text-sm font-medium text-primary-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading images...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-surface-200 flex justify-end gap-4">
              <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary min-w-[140px]">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Publish Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;
