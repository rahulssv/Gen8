
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const Hero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative pt-32 pb-16 px-6 md:px-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "opacity-0",
            mounted && "animate-slide-down"
          )}>
            <span className="inline-block mb-4 px-4 py-1.5 text-sm font-medium text-bioquery-700 bg-bioquery-50 rounded-full">
              Biomedical Research Simplified
            </span>
          </div>
          
          <h1 className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl opacity-0",
            mounted && "animate-slide-down delay-100"
          )}>
            Extract insights from biomedical literature
            <span className="highlight-text"> in minutes, not hours</span>
          </h1>
          
          <p className={cn(
            "text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 opacity-0",
            mounted && "animate-slide-down delay-200"
          )}>
            Efficiently extract and interpret complex information from research articles
            using our advanced curation platform designed for biomedical researchers.
          </p>
          
          <div className={cn(
            "flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 opacity-0",
            mounted && "animate-slide-down delay-300"
          )}>
            <button className="button-transition h-12 px-8 rounded-lg bg-bioquery-600 text-white font-medium hover:bg-bioquery-700 focus:outline-none focus:ring-2 focus:ring-bioquery-600 focus:ring-offset-2 shadow-lg">
              Start Curating Now
            </button>
            <button className="button-transition h-12 px-8 rounded-lg bg-white text-bioquery-700 font-medium border border-bioquery-200 hover:bg-bioquery-50 focus:outline-none focus:ring-2 focus:ring-bioquery-600 focus:ring-offset-2">
              Watch Demo
            </button>
          </div>
        </div>
      </div>
      
      {/* Gradient orbs */}
      <div className="absolute top-40 -left-64 w-96 h-96 bg-bioquery-200 rounded-full opacity-20 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-bioquery-500 rounded-full opacity-10 blur-3xl -z-10"></div>
    </section>
  );
};

export default Hero;
