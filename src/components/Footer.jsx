import { Link } from 'react-router-dom';
import { Mail, MapPin, Twitter, Instagram, Linkedin, Building2, Github, ExternalLink } from 'lucide-react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Properties', to: '/properties' },
  { label: 'Housemates', to: '/housemates' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
];

const Footer = () => {
  return (
    <footer className="bg-surface-900 text-surface-200 mt-20 relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-primary-600 transition-all duration-300">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Rent<span className="text-primary-400">Mate</span>
              </span>
            </Link>
            <p className="text-surface-400 text-base leading-relaxed max-w-sm">
              Revolutionizing the way you find your next home. Our platform connects you with the perfect space and the ideal people, making urban living seamless and social.
            </p>
            <div className="flex gap-4 mt-8">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Github, label: 'GitHub' }
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-10 h-10 bg-surface-800 hover:bg-primary-500 text-surface-300 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1 shadow-md"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              Explore
              <div className="w-8 h-[2px] bg-primary-500/30 rounded-full" />
            </h4>
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-surface-400 hover:text-primary-400 text-sm font-medium flex items-center gap-2 transition-all duration-200 group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-surface-700 group-hover:bg-primary-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="md:col-span-4">
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              Contact Us
              <div className="w-8 h-[2px] bg-primary-500/30 rounded-full" />
            </h4>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-primary-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-0.5">Support Email</p>
                  <a href="mailto:hello@rentmate.io" className="text-surface-300 hover:text-primary-400 font-medium transition-colors">hello@rentmate.io</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-primary-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-0.5">Location</p>
                  <p className="text-surface-300 font-medium">12th Floor, Metro Tower, Bengaluru</p>
                </div>
              </li>
            </ul>
            
            <div className="p-4 rounded-2xl bg-surface-800/50 border border-surface-700/50">
              <p className="text-xs text-surface-400 mb-3">Newsletter</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-surface-900 border-none rounded-xl px-4 py-2.5 text-xs flex-1 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                />
                <button className="bg-primary-500 hover:bg-primary-600 text-white p-2.5 rounded-xl transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-surface-800 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-surface-500 text-sm">
            © {new Date().getFullYear()} <span className="text-surface-300 font-semibold">RentMate</span>. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs text-surface-500">
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
