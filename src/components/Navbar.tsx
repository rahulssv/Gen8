
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FileText, Database, Search, TestTube, FileSearch } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all-300',
        scrolled
          ? 'py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm'
          : 'py-5 bg-transparent'
      )}
    >
      <div className="container flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2 group"
          aria-label="InsightMed Home"
        >
          <div className="w-10 h-10 rounded-md flex items-center justify-center bg-insight-500 text-white 
                          transition-all duration-300 group-hover:scale-105">
            <Database className="w-5 h-5" />
          </div>
          <div className="font-bold text-xl">
            <span className="text-gray-900 dark:text-white">Insight</span>
            <span className="text-insight-500">Med</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <NavLink href="/" active={location.pathname === '/'}>
            <Search className="w-4 h-4 mr-1.5" />
            <span>Search</span>
          </NavLink>
          <NavLink href="/article-analyzer" active={location.pathname === '/article-analyzer'}>
            <FileText className="w-4 h-4 mr-1.5" />
            <span>Article Analyzer</span>
          </NavLink>
          <NavLink href="/diagnostic-tool" active={location.pathname === '/diagnostic-tool'}>
            <TestTube className="w-4 h-4 mr-1.5" />
            <span>Diagnostic Tool</span>
          </NavLink>
          <NavLink href="/biomarker-reference" active={location.pathname === '/biomarker-reference'}>
            <FileSearch className="w-4 h-4 mr-1.5" />
            <span>Biomarker Reference</span>
          </NavLink>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link
            to="/article-analyzer"
            className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Article Analyzer"
          >
            <FileText className="w-5 h-5" />
          </Link>
          <Link
            to="/diagnostic-tool"
            className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Diagnostic Tool"
          >
            <TestTube className="w-5 h-5" />
          </Link>
          <Link
            to="/biomarker-reference"
            className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Biomarker Reference"
          >
            <FileSearch className="w-5 h-5" />
          </Link>
          <Link
            to="/"
            className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink = ({ href, active, children }: NavLinkProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all-200",
        active
          ? "bg-insight-100 text-insight-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      )}
    >
      {children}
    </Link>
  );
};

export default Navbar;
