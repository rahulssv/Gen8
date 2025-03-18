
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t py-12 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <Link 
              to="/" 
              className="flex items-center space-x-2 mb-4"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bioquery-500 to-bioquery-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-medium">BioQuery</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs mb-4">
              A modern curation platform that helps researchers efficiently extract and interpret 
              information from biomedical literature.
            </p>
            <p className="text-sm text-muted-foreground/80">
              © {new Date().getFullYear()} BioQuery. All rights reserved.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Platform</h3>
            <ul className="space-y-3">
              <FooterLink to="/features">Features</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/integrations">Integrations</FooterLink>
              <FooterLink to="/docs">Documentation</FooterLink>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-3">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  return (
    <li>
      <Link 
        to={to} 
        className="text-muted-foreground hover:text-bioquery-600 transition-colors text-sm"
      >
        {children}
      </Link>
    </li>
  );
};

export default Footer;
