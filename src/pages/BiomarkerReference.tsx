
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BiomarkerCard from '@/components/BiomarkerCard';
import { BIOMARKER_RANGES } from '@/utils/diagnosticUtils';

const BiomarkerReference = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Define biomarker reference data
  const biomarkerData = [
    {
      id: "CA153",
      name: "Cancer Antigen 15-3 (CA 15-3)",
      description: "A protein produced by normal breast cells and breast cancer cells, often elevated in breast cancer.",
      significance: "Used to monitor response to breast cancer treatment and detect recurrence. Higher levels may indicate disease progression or metastasis.",
      range: BIOMARKER_RANGES.CA153,
      normalRange: "< 25 U/mL",
      type: "blood" as const,
    },
    {
      id: "CEA",
      name: "Carcinoembryonic Antigen (CEA)",
      description: "A protein found in the tissues of a developing baby. In adults, it can be a sign of cancer.",
      significance: "Elevated in various cancers including breast cancer. Most useful for monitoring metastatic disease, especially to the liver.",
      range: BIOMARKER_RANGES.CEA,
      normalRange: "< 2.5 ng/mL",
      type: "blood" as const,
    },
    {
      id: "HER2",
      name: "Human Epidermal Growth Factor Receptor 2",
      description: "A protein that promotes cancer cell growth. When overexpressed, indicates HER2-positive breast cancer.",
      significance: "Determines eligibility for HER2-targeted therapies like trastuzumab. Associated with more aggressive disease but good response to targeted therapy.",
      range: BIOMARKER_RANGES.HER2,
      normalRange: "0 to 1+ (IHC) or non-amplified (FISH)",
      type: "tissue" as const,
    },
    {
      id: "Ki67",
      name: "Ki-67 Proliferation Index",
      description: "A protein marker for cellular proliferation, indicating how quickly tumor cells are dividing.",
      significance: "Higher values indicate more aggressive tumors. Used to distinguish between Luminal A and Luminal B subtypes.",
      range: BIOMARKER_RANGES.Ki67,
      normalRange: "< 15%",
      type: "tissue" as const,
    },
    {
      id: "ER",
      name: "Estrogen Receptor (ER)",
      description: "Hormone receptors that bind to estrogen, potentially stimulating cancer growth.",
      significance: "ER-positive tumors are eligible for hormonal therapies. Positive status generally indicates better prognosis.",
      range: BIOMARKER_RANGES.ER,
      normalRange: "< 1% of cells (negative)",
      type: "tissue" as const,
    },
    {
      id: "PR",
      name: "Progesterone Receptor (PR)",
      description: "Hormone receptors that bind to progesterone, potentially stimulating cancer growth.",
      significance: "PR-positive tumors may respond to hormonal therapies. Often co-expressed with ER.",
      range: BIOMARKER_RANGES.PR,
      normalRange: "< 1% of cells (negative)",
      type: "tissue" as const,
    },
    {
      id: "p53",
      name: "p53 Tumor Suppressor",
      description: "A protein that normally prevents cancer formation. Mutations lead to loss of tumor suppression.",
      significance: "Mutated p53 is associated with more aggressive disease and worse outcomes in breast cancer.",
      range: BIOMARKER_RANGES.p53,
      normalRange: "< 5% of cells (wild-type expression)",
      type: "tissue" as const,
    },
    {
      id: "CTCs",
      name: "Circulating Tumor Cells",
      description: "Cancer cells that have detached from the tumor and entered the bloodstream.",
      significance: "Higher CTC counts correlate with disease progression, metastasis risk, and worse prognosis.",
      range: BIOMARKER_RANGES.CTCs,
      normalRange: "0 cells/7.5mL of blood",
      type: "liquid-biopsy" as const,
    },
    {
      id: "ctDNA",
      name: "Circulating Tumor DNA",
      description: "Fragments of DNA from tumor cells found in the bloodstream.",
      significance: "Used for non-invasive monitoring of tumor burden, treatment response, and emergence of resistance mutations.",
      range: {
        name: "Circulating Tumor DNA",
        low: 0,
        normal: 0.01,
        high: 1,
        critical: 10,
        unit: "%"
      },
      normalRange: "< 0.01% of total cfDNA",
      type: "liquid-biopsy" as const,
    },
    {
      id: "BRCA",
      name: "BRCA1/2 Mutation Status",
      description: "Inherited mutations in BRCA1 or BRCA2 genes that increase risk of breast and ovarian cancers.",
      significance: "Pathogenic mutations indicate higher risk of breast cancer and may inform surgical decisions and PARP inhibitor eligibility.",
      range: {
        name: "BRCA1/2",
        low: 0,
        normal: 0,
        high: 1,
        critical: 1,
        unit: ""
      },
      normalRange: "No pathogenic variants",
      type: "tissue" as const,
    },
  ];
  
  // Filter biomarkers based on search query
  const filteredBiomarkers = biomarkerData.filter(biomarker => 
    biomarker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    biomarker.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group biomarkers by type
  const bloodBiomarkers = filteredBiomarkers.filter(bm => bm.type === 'blood');
  const tissueBiomarkers = filteredBiomarkers.filter(bm => bm.type === 'tissue');
  const liquidBiopsyBiomarkers = filteredBiomarkers.filter(bm => bm.type === 'liquid-biopsy');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-bold mb-4">Biomarker Reference Guide</h1>
              <p className="text-secondary-foreground max-w-2xl mx-auto">
                Comprehensive information on biomarkers used in breast cancer diagnosis, classification, and monitoring.
              </p>
            </div>
            
            <div className="mb-8 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search biomarkers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 diagnostic-input"
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="blood">Blood</TabsTrigger>
                <TabsTrigger value="tissue">Tissue</TabsTrigger>
                <TabsTrigger value="liquid-biopsy">Liquid Biopsy</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBiomarkers.map((biomarker) => (
                    <BiomarkerCard key={biomarker.id} biomarker={biomarker} />
                  ))}
                </div>
                {filteredBiomarkers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-secondary-foreground">No biomarkers found matching your search criteria.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="blood" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bloodBiomarkers.map((biomarker) => (
                    <BiomarkerCard key={biomarker.id} biomarker={biomarker} />
                  ))}
                </div>
                {bloodBiomarkers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-secondary-foreground">No blood biomarkers found matching your search criteria.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tissue" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tissueBiomarkers.map((biomarker) => (
                    <BiomarkerCard key={biomarker.id} biomarker={biomarker} />
                  ))}
                </div>
                {tissueBiomarkers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-secondary-foreground">No tissue biomarkers found matching your search criteria.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="liquid-biopsy" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liquidBiopsyBiomarkers.map((biomarker) => (
                    <BiomarkerCard key={biomarker.id} biomarker={biomarker} />
                  ))}
                </div>
                {liquidBiopsyBiomarkers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-secondary-foreground">No liquid biopsy biomarkers found matching your search criteria.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BiomarkerReference;
