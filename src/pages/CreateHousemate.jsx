import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../supabase';
import { Users, Loader2 } from 'lucide-react';

const CreateHousemate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || '',
    age: '',
    occupation: '',
    rent_share: '',
    city: 'Bengaluru',
    location: '',
    avatar: '',
    gender: 'Any',
    preferred_gender: 'Any',
    room_type: 'Private Room',
    move_in: '',
    bio: '',
    interests: ''
  });

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const interestsArray = form.interests.split(',').map(a => a.trim()).filter(Boolean);
    const defaultAvatar = form.avatar.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.name}`;

    const { error: insertError } = await supabase.from('housemates').insert([
      {
        user_id: user.id,
        name: form.name,
        age: parseInt(form.age) || 20,
        occupation: form.occupation,
        rent_share: parseInt(form.rent_share) || 0,
        city: form.city,
        location: form.location,
        avatar: defaultAvatar,
        gender: form.gender,
        preferred_gender: form.preferred_gender,
        room_type: form.room_type,
        move_in: form.move_in || 'Flexible',
        bio: form.bio,
        interests: interestsArray
      }
    ]);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      navigate('/housemates');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-accent-600 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8" /> Find a Housemate
            </h1>
            <p className="mt-2 text-primary-100">Create a profile so others looking for roommates can find you.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
                <input required type="text" name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="e.g. Alex Johnson" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Age</label>
                <input required type="number" name="age" value={form.age} onChange={handleChange} className="input-field" min="16" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Occupation</label>
                <input required type="text" name="occupation" value={form.occupation} onChange={handleChange} className="input-field" placeholder="e.g. Software Engineer" />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Preferred Area</label>
                  <input required type="text" name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="e.g. Koramangala or Indiranagar" />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">City</label>
                  <select name="city" value={form.city} onChange={handleChange} className="input-field">
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Max Rent Share (₹/mo)</label>
                <input required type="number" name="rent_share" value={form.rent_share} onChange={handleChange} className="input-field" placeholder="15000" min="0" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Move-in Date</label>
                <input required type="text" name="move_in" value={form.move_in} onChange={handleChange} className="input-field" placeholder="e.g. Oct 1st or Flexible" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">My Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Couple">Couple</option>
                  <option value="Any">Any</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Looking for (Roommate Gender)</label>
                <select name="preferred_gender" value={form.preferred_gender} onChange={handleChange} className="input-field">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Couple">Couple</option>
                  <option value="Any">No Preference</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Room Type Required</label>
                <select name="room_type" value={form.room_type} onChange={handleChange} className="input-field">
                  <option value="Private Room">Private Room</option>
                  <option value="Shared Room">Shared Room</option>
                  <option value="Any">Any</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Bio</label>
                <textarea required name="bio" value={form.bio} onChange={handleChange} className="input-field" rows="3" placeholder="Tell potential housemates a bit about yourself, your habits, and what you're looking for..." />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Interests (comma separated)</label>
                <input type="text" name="interests" value={form.interests} onChange={handleChange} className="input-field" placeholder="e.g. Reading, Gym, Cooking, Music" />
              </div>

            </div>

            <div className="pt-6 border-t border-surface-200 flex justify-end gap-4">
              <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 min-w-[140px] justify-center">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateHousemate;
