
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getApiKey, setApiKey } from '@/api/api';

interface SearchBarProps {
  size?: 'default' | 'large';
  className?: string;
}

const SearchBar = ({ size = 'default', className = '' }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [apiKey, setApiKeyState] = useState(getApiKey() || '');
  const [showApiInput, setShowApiInput] = useState(!getApiKey());
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }
    
    if (!apiKey && !getApiKey()) {
      toast({
        title: "API Key required",
        description: "Please enter your API key",
        variant: "destructive",
      });
      setShowApiInput(true);
      return;
    }
    
    if (apiKey) {
      setApiKey(apiKey);
    }
    
    navigate(`/results?q=${encodeURIComponent(query)}`);
  };

  const toggleApiInput = () => {
    setShowApiInput(!showApiInput);
  };

  return (
    <div className={`w-full transition-all duration-300 ${className}`}>
      <form onSubmit={handleSearch} className="w-full">
        <div className="relative">
          <div className={`flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full shadow-sm overflow-hidden transition-all duration-300 ${
            size === 'large' ? 'h-16' : 'h-12'
          }`}>
            <div className="flex items-center justify-center pl-4">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="What is the best treatment for BRAF V600E mutation in colorectal cancer?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`flex-grow px-3 py-2 bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400 text-gray-900 dark:text-white ${
                size === 'large' ? 'text-lg' : 'text-base'
              }`}
              aria-label="Search query"
            />
            <Button
              type="submit"
              className={`rounded-full mr-1 bg-insight-500 hover:bg-insight-600 text-white ${
                size === 'large' ? 'h-14 px-6 text-base' : 'h-10 px-4 text-sm'
              }`}
            >
              {size === 'large' ? (
                <span className="flex items-center">
                  Search <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {showApiInput && (
          <div className="mt-3 transition-all duration-300 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="relative flex-grow">
                <input
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKeyState(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-insight-500"
                  aria-label="API Key"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="text-sm"
                onClick={toggleApiInput}
              >
                Cancel
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
        )}
        
        {!showApiInput && !apiKey && !getApiKey() && (
          <div className="mt-3 flex justify-end">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="text-xs text-gray-500 hover:text-insight-600"
              onClick={toggleApiInput}
            >
              Set API Key
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
