
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-apple px-6 md:px-10 py-4",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-subtle" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 transition-opacity duration-300 hover:opacity-80"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-bioquery-500 to-bioquery-700 flex items-center justify-center">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="text-xl font-medium tracking-tight">BioQuery</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button 
            className="button-transition rounded-full h-10 px-6 bg-bioquery-500 text-white hover:bg-bioquery-600 focus:outline-none focus:ring-2 focus:ring-bioquery-500 focus:ring-offset-2"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  return (
    <Link 
      to={to} 
      className="text-foreground/80 hover:text-bioquery-600 transition-colors duration-200 font-medium"
    >
      {children}
    </Link>
  );
};

export default Header;
