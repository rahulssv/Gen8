
import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SearchForm from '@/components/SearchForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import Footer from '@/components/Footer';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleBackToSearch = () => {
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {!hasSearched ? (
          <>
            <Hero />
            <SearchForm onSearch={handleSearch} />
            
            <section className="py-16 px-6 md:px-10 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FeatureCard 
                    title="Time-Saving" 
                    description="Reduce research time from hours to minutes with our advanced extraction and summarization tools."
                  />
                  <FeatureCard 
                    title="Evidence-Based" 
                    description="Generate comprehensive summaries with statistical data and direct references to source articles."
                  />
                  <FeatureCard 
                    title="Customizable" 
                    description="Tailor your research to specific mutations, biomarkers, drugs, or clinical trials."
                  />
                </div>
              </div>
            </section>
          </>
        ) : (
          <ResultsDisplay 
            query={searchQuery}
            onBack={handleBackToSearch}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border hover:shadow-hover transition-all duration-300">
      <div className="w-12 h-12 rounded-full bg-bioquery-100 flex items-center justify-center mb-4">
        <div className="w-6 h-6 rounded-md bg-bioquery-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
