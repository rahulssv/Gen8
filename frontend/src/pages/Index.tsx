import { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Database, FileText, BarChart, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-insight-50/30 to-transparent dark:from-insight-950/10 dark:to-transparent" />
        
        <div className="w-full max-w-4xl mx-auto text-center z-10 animate-fade-in">
          <div className="mb-3 flex justify-center">
            <Badge className="text-sm font-medium px-3 py-1 bg-insight-100 text-insight-700 border-insight-200">
              Medical Research Insights
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-gray-900 dark:text-white">
            Discover clinical insights from<br /> 
            <span className="text-insight-600">research literature</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Extract, analyze, and summarize critical information from medical research 
            databases to support evidence-based practice and decision making.
          </p>
          
          <div className="mb-10">
            <SearchBar size="large" className="max-w-3xl mx-auto" />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/article-analyzer">
              <Button 
                variant="outline" 
                className="h-11 px-5 rounded-full border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-black/20 backdrop-blur-sm hover:bg-white hover:shadow-sm"
              >
                <FileText className="mr-2 h-4 w-4" />
                Analyze Single Article
              </Button>
            </Link>
            
            <a 
              href="#features"
              className="inline-flex"
            >
              <Button 
                variant="ghost" 
                className="h-11 px-5 rounded-full text-gray-600 hover:text-gray-900 hover:bg-white/50 dark:hover:bg-white/5"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
          <a href="#features" className="text-gray-400 hover:text-gray-600">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Streamline Your Research Curation Process
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform uses advanced AI to extract and synthesize information from multiple research sources.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search className="h-8 w-8 text-insight-600" />}
              title="Intelligent Search"
              description="Our AI searches across multiple databases including PubMed, Taylor & Francis, and Science Direct to find the most relevant articles."
            />
            
            <FeatureCard 
              icon={<Database className="h-8 w-8 text-insight-600" />}
              title="Information Extraction"
              description="Identifies biomarkers, mutations, drugs, and their relationships using advanced Natural Language Processing techniques."
            />
            
            <FeatureCard 
              icon={<BarChart className="h-8 w-8 text-insight-600" />}
              title="Data Visualization"
              description="Presents statistical findings from research in clear, interactive charts to help you understand complex relationships."
            />
            
            <FeatureCard 
              icon={<FileText className="h-8 w-8 text-insight-600" />}
              title="Concise Summaries"
              description="Generates evidence-based summaries that focus on your specific query, avoiding generic overviews."
            />
            
            <FeatureCard 
              icon={
                <svg className="h-8 w-8 text-insight-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="PDF Export"
              description="Export your research findings in professionally formatted PDF reports for easy sharing and reference."
            />
            
            <FeatureCard 
              icon={
                <svg className="h-8 w-8 text-insight-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="AI Q&A"
              description="Get answers to specific questions about your research topic, powered by our AI that understands medical terminology."
            />
          </div>
        </div>
      </div>
      
      {/* Use Cases Section */}
      <div className="py-20 px-6 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Who Benefits from InsightMed?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform is designed for various professionals in the medical research field.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UseCaseCard 
              title="Clinical Researchers"
              description="Rapidly synthesize information from multiple studies to identify promising research directions and treatment options."
            />
            
            <UseCaseCard 
              title="Bio-Curators"
              description="Efficiently extract and organize biomedical information from research literature for databases and knowledge bases."
            />
            
            <UseCaseCard 
              title="Healthcare Professionals"
              description="Access evidence-based summaries to support clinical decision-making and stay updated on the latest research."
            />
            
            <UseCaseCard 
              title="Pharmaceutical Companies"
              description="Accelerate drug discovery by identifying relationships between biomarkers, mutations, and potential therapeutic targets."
            />
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-20 px-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to transform your research workflow?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Start extracting valuable insights from medical literature today.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#top">
              <Button 
                className="h-12 px-8 rounded-full bg-insight-500 hover:bg-insight-600"
              >
                <Search className="mr-2 h-4 w-4" />
                Start Searching
              </Button>
            </a>
            
            <Link to="/article-analyzer">
              <Button 
                variant="outline" 
                className="h-12 px-8 rounded-full border-gray-300 dark:border-gray-700"
              >
                <FileText className="mr-2 h-4 w-4" />
                Try Article Analyzer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
      <div className="mb-4 inline-block p-3 bg-insight-50 dark:bg-insight-900/20 rounded-lg">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
};

const UseCaseCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
};

export default Index;
