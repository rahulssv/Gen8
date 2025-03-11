
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Activity, FileText, Target, Database } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeIn');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scroll-animation').forEach((el) => {
      observer.observe(el);
      el.classList.add('opacity-0');
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
              Precision Oncology Diagnostics for Breast Cancer
            </h1>
            <p className="text-xl text-secondary-foreground mb-8 max-w-2xl mx-auto">
              Advanced biomarker analysis platform for clinical evaluation of breast cancer subtypes, staging, and personalized treatment recommendations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/diagnostic">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                  Start Diagnosis
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-200"
                onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature Overview */}
      <section ref={featuresRef} className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Diagnostic Platform</h2>
            <p className="text-secondary-foreground">
              OncoSignal provides clinicians with advanced tools to analyze biomarkers and diagnose breast cancer with precision and confidence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 scroll-animation">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Database size={24} className="text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">Biomarker Analysis</h3>
              <p className="text-secondary-foreground text-sm">
                Comprehensive analysis of blood-based and liquid biopsy biomarkers to aid in cancer diagnosis and monitoring.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 scroll-animation">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Activity size={24} className="text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">Cancer Staging</h3>
              <p className="text-secondary-foreground text-sm">
                Evidence-based staging assessments using multiple biomarkers and clinical parameters.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 scroll-animation">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Target size={24} className="text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">Subtype Classification</h3>
              <p className="text-secondary-foreground text-sm">
                Identify breast cancer molecular subtypes to guide targeted therapy selection and treatment planning.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 scroll-animation">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <FileText size={24} className="text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-2">Treatment Insights</h3>
              <p className="text-secondary-foreground text-sm">
                Clinical decision support with evidence-based treatment recommendations tailored to patient profiles.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Information Section */}
      <section className="py-16 md:py-24 bg-white scroll-animation">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Advanced Biomarker Analytics</h2>
              <p className="text-secondary-foreground mb-6">
                OncoSignal integrates analysis of traditional and emerging biomarkers to provide a comprehensive view of breast cancer status and progression.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-primary text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Blood-based Markers</h3>
                    <p className="text-sm text-secondary-foreground">
                      Analysis of CA 15-3, CEA, and other serum biomarkers that correlate with tumor burden and disease progression.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-primary text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Molecular Subtyping</h3>
                    <p className="text-sm text-secondary-foreground">
                      Evaluation of ER, PR, HER2, and Ki-67 status to determine molecular subtype and guide treatment decisions.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-primary text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Liquid Biopsy</h3>
                    <p className="text-sm text-secondary-foreground">
                      Analysis of circulating tumor cells (CTCs) and cell-free DNA to detect minimal residual disease and early recurrence.
                    </p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link to="/reference">
                  <Button variant="outline" className="border-gray-200">
                    Explore Biomarkers
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="glass-panel rounded-xl p-1 rotate-1 animate-float">
              <div className="bg-white rounded-lg p-6 -rotate-1 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-20 text-sm font-medium">CA 15-3:</div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/80 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium">40 U/mL</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-20 text-sm font-medium">CEA:</div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium">7.5 ng/mL</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-20 text-sm font-medium">HER2:</div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium">3+</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-20 text-sm font-medium">Ki-67:</div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium">25%</div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-500">Diagnosis</div>
                        <div className="font-medium">HER2-Positive</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Stage</div>
                        <div className="font-medium">Stage II</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Risk</div>
                        <Badge className="bg-yellow-100 text-yellow-800">MODERATE</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5 scroll-animation">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Begin Your Diagnostic Assessment</h2>
            <p className="text-xl text-secondary-foreground mb-8">
              Use our advanced diagnostic tool to analyze biomarker data and receive clinical insights for your patients.
            </p>
            <Link to="/diagnostic">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                Start Diagnosis
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
