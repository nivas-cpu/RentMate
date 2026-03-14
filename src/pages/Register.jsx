import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ROLES = ['Tenant', 'Owner', 'Both'];

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Tenant',
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const { register, verifyOTP, resendOTP, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if authenticated AND NOT currently in the verification flow
    if (isAuthenticated && !success) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log('Starting registration for:', form.email);
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const data = await register(form.email, form.password, { 
        full_name: `${form.firstName} ${form.lastName}`,
        role: form.role
      });
      console.log('Registration response:', data);
      
      if (data) {
        setSuccess(true);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setResendSuccess(false);
    if (otp.length !== 8) {
      setError('Please enter a valid 8-digit code.');
      return;
    }

    setVerifying(true);
    try {
      await verifyOTP(form.email, otp);
      // AuthContext handles navigation to '/'
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    setResending(true);
    setResendSuccess(false);
    try {
      await resendOTP(form.email);
      setResendSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const inputClass = "input-field";
  const labelClass = "block text-sm font-medium text-surface-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-primary-900 to-surface-900 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-lg relative z-10 mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
          <div className="h-2 bg-gradient-to-r from-primary-400 to-accent-500" />

          <div className="p-8 sm:p-12">
            {/* Logo */}
            <div className="flex justify-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="text-3xl font-black text-surface-900 tracking-tight">
                  Rent<span className="text-primary-500">Mate</span>
                </span>
              </div>
            </div>

            {success ? (
              <div className="text-center animate-fade-in max-w-sm mx-auto">
                <div className="w-24 h-24 bg-primary-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.268 0 2.39.234 3.41.659m-4.74 15.656a10.003 10.003 0 01-4.708-7.226m.642 4.57a8.388 8.388 0 005.419-3.97m5.42 3.97a8.388 8.388 0 01-5.419-3.97m5.419 3.97L15 21m.002-12.243a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-surface-900 mb-3 tracking-tight">Verify your account</h2>
                <p className="text-surface-600 mb-10 leading-relaxed font-medium">
                  We've sent an <span className="text-primary-600 font-bold">8-digit code</span> to <span className="font-bold text-surface-900 border-b-2 border-primary-200">{form.email}</span>. Please enter it below.
                </p>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-2xl mb-8 ring-1 ring-red-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-8">
                  <div className="flex justify-center">
                    <input
                      id="otp-input"
                      type="text"
                      maxLength={8}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="00000000"
                      className="w-full text-center text-4xl font-black tracking-[0.3em] py-5 rounded-3xl border-2 border-surface-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none placeholder-surface-200"
                    />
                  </div>

                  <button type="submit" disabled={verifying || otp.length !== 8} className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary-500/30">
                    {verifying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : 'Confirm Verification'}
                  </button>

                  <div className="flex flex-col items-center gap-4">
                    <button 
                      type="button" 
                      onClick={handleResendOTP} 
                      disabled={resending}
                      className="text-primary-600 hover:text-primary-700 text-sm font-extrabold transition-colors disabled:opacity-50"
                    >
                      {resending ? 'Re-sending...' : "Didn't receive the code? Resend"}
                    </button>
                    
                    {resendSuccess && (
                      <p className="text-emerald-600 text-xs font-bold animate-fade-in bg-emerald-50 px-4 py-2 rounded-full ring-1 ring-emerald-200 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        New code sent! Check your inbox.
                      </p>
                    )}
                  </div>

                  <button type="button" onClick={() => setSuccess(false)} className="text-surface-400 hover:text-primary-600 text-xs font-bold transition-colors uppercase tracking-widest mt-4">
                    ← Update Email Address
                  </button>
                </form>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-surface-900 text-center">Create your account</h2>
                <p className="text-surface-500 text-center mt-1 mb-8">Join thousands of renters & owners</p>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-xl mb-6 text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg-first-name" className={labelClass}>First Name</label>
                      <input id="reg-first-name" name="firstName" type="text" required value={form.firstName} onChange={handleChange} placeholder="Jane" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="reg-last-name" className={labelClass}>Last Name</label>
                      <input id="reg-last-name" name="lastName" type="text" required value={form.lastName} onChange={handleChange} placeholder="Doe" className={inputClass} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="reg-email" className={labelClass}>Email address</label>
                    <input id="reg-email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="reg-phone" className={labelClass}>Phone number</label>
                    <input id="reg-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 00000 00000" className={inputClass} />
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="reg-role" className={labelClass}>I am a</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setForm({ ...form, role })}
                          className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                            form.role === role
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-surface-200 text-surface-600 hover:border-primary-300'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="reg-password" className={labelClass}>Password</label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min. 8 characters"
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                        aria-label="Toggle password"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="reg-confirm-password" className={labelClass}>Confirm Password</label>
                    <input
                      id="reg-confirm-password"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className={inputClass}
                    />
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="agree"
                      checked={form.agree}
                      onChange={handleChange}
                      required
                      className="mt-1 w-4 h-4 accent-primary-500 rounded shrink-0"
                    />
                    <span className="text-sm text-surface-600">
                      I agree to the{' '}
                      <a href="#" className="text-primary-600 hover:underline font-medium">Terms of Service</a>{' '}
                      and{' '}
                      <a href="#" className="text-primary-600 hover:underline font-medium">Privacy Policy</a>
                    </span>
                  </label>

                  <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              </>
            )}

            <p className="text-center text-surface-500 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>

            {/* Developer Shortcut to verify implementation */}
            <div className="mt-10 pt-6 border-t border-surface-100 flex justify-center">
              <button 
                onClick={() => setSuccess(!success)}
                className="text-[10px] uppercase tracking-widest text-surface-300 hover:text-primary-400 font-bold transition-colors"
                title="Only for testing purposes"
              >
                Development: {success ? '← Back to Form' : 'Preview OTP Screen →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
