
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Microscope } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Microscope size={20} className="text-primary" />
              <span className="font-semibold text-lg">OncoSignal</span>
            </div>
            <p className="text-secondary-foreground text-sm max-w-xs">
              Advanced diagnostic platform for oncologists to analyze biomarkers for breast cancer staging and diagnosis.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-secondary-foreground text-sm hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/diagnostic" className="text-secondary-foreground text-sm hover:text-primary transition-colors">Diagnostic Tool</Link></li>
              <li><Link to="/reference" className="text-secondary-foreground text-sm hover:text-primary transition-colors">Biomarker Reference</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-secondary-foreground text-sm hover:text-primary transition-colors">Research Papers</a></li>
              <li><a href="#" className="text-secondary-foreground text-sm hover:text-primary transition-colors">Methodology</a></li>
              <li><a href="#" className="text-secondary-foreground text-sm hover:text-primary transition-colors">Clinical Studies</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-secondary-foreground text-sm hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-secondary-foreground text-sm hover:text-primary transition-colors">Terms of Use</a></li>
              <li><a href="#" className="text-secondary-foreground text-sm hover:text-primary transition-colors">Data Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-secondary-foreground">
            © {new Date().getFullYear()} OncoSignal. All rights reserved.
          </p>
          <p className="text-sm text-secondary-foreground mt-4 md:mt-0">
            For medical professionals only. Not for diagnostic use outside clinical settings.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
