import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Logo from './Logo';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleGetStarted = () => {
    if (location.pathname === '/') {
      document.getElementById('join-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#join-section');
      setTimeout(() => {
        document.getElementById('join-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between z-10 relative pt-6 lg:pt-8 transition-colors duration-300">
      <Link to="/" className="flex items-center gap-2">
        <Logo className="w-10 h-8" />
        <span className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight transition-colors duration-300">Meet<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">Sphere</span></span>
      </Link>
      <div className="hidden md:flex items-center gap-8">
        <Link to="/how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-colors duration-300">How it works</Link>
        <Link to="/features" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-colors duration-300">Features</Link>
        <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-colors duration-300">About</Link>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-300 shadow-sm"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm">
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
