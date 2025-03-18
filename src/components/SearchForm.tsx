
import { useState } from 'react';
import { Search } from 'lucide-react';

const SearchForm = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Search Biomedical Research</h2>
        <p className="text-muted-foreground">
          Enter your research question or keywords to find relevant articles
        </p>
      </div>
      
      <form 
        onSubmit={handleSubmit}
        className="w-full"
      >
        <div 
          className={`
            relative group transition-all duration-300 
            ${isFocused ? 'shadow-lg transform -translate-y-1' : 'shadow-subtle'}
            bg-white border rounded-xl overflow-hidden
          `}
        >
          <div className="flex items-center w-full">
            <div className="pl-5">
              <Search 
                className={`
                  w-5 h-5 transition-colors duration-300 
                  ${isFocused ? 'text-bioquery-600' : 'text-muted-foreground'}
                `} 
              />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="e.g., What is the best treatment for BRAF V600E mutation in colorectal cancer?"
              className="flex-1 py-4 px-3 text-base md:text-lg placeholder-muted-foreground/60 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="button-transition m-1.5 py-2.5 px-5 md:px-8 rounded-lg bg-bioquery-600 text-white font-medium hover:bg-bioquery-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bioquery-500"
            >
              Search
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <ExampleChip onClick={() => setQuery("BRAF V600E mutation in colorectal cancer")}>
            BRAF V600E mutation
          </ExampleChip>
          <ExampleChip onClick={() => setQuery("Effect of KRAS mutation on lung cancer treatment")}>
            KRAS mutation
          </ExampleChip>
          <ExampleChip onClick={() => setQuery("Statistical efficacy of encorafenib and cetuximab")}>
            Drug efficacy stats
          </ExampleChip>
        </div>
      </form>
    </div>
  );
};

const ExampleChip = ({ 
  children, 
  onClick 
}: { 
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="button-transition py-1.5 px-3 text-sm bg-secondary text-muted-foreground rounded-full hover:bg-bioquery-100 hover:text-bioquery-700"
    >
      {children}
    </button>
  );
};

export default SearchForm;
