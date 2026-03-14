import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 relative overflow-hidden group"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ y: 20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {isDark ? (
            <Moon className="w-5 h-5 fill-primary-400/20" />
          ) : (
            <Sun className="w-5 h-5 fill-yellow-400/20" />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-primary-500/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl" />
    </button>
  );
};

export default ThemeToggle;
