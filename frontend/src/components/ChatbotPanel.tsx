
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, User, SendIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QueryResult } from '@/api/types';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatbotPanelProps {
  result: QueryResult;
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotPanel = ({ result, isOpen, onClose }: ChatbotPanelProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `I've analyzed ${result.articles.length} articles related to "${result.query}". How can I help you understand the results better?`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      generateResponse(input, result);
    }, 1000);
  };

  const generateResponse = (userMessage: string, searchResult: QueryResult) => {
    // This is a simplified mock response generator
    // In a real application, you would send the query to an API
    
    let responseContent = '';
    
    if (userMessage.toLowerCase().includes('treatment') || userMessage.toLowerCase().includes('therapy')) {
      responseContent = `Based on the analyzed articles, the most effective treatment approach for ${searchResult.query} involves targeted therapy with BRAF inhibitors combined with EGFR inhibitors. The combination of encorafenib and cetuximab has shown a median overall survival of 15 months compared to 10 months with standard therapy (HR 0.61, p=0.0003).`;
    } else if (userMessage.toLowerCase().includes('survival') || userMessage.toLowerCase().includes('prognosis')) {
      responseContent = `Patients with ${searchResult.query} typically have a median overall survival of 15 months when treated with the combination of encorafenib and cetuximab, compared to 10 months with standard chemotherapy. The hazard ratio for death was 0.61 (p=0.0003), indicating a 39% reduction in the risk of death with this treatment approach.`;
    } else if (userMessage.toLowerCase().includes('side effect') || userMessage.toLowerCase().includes('adverse')) {
      responseContent = `Common side effects of the recommended treatments include skin reactions (rash, dry skin), fatigue, nausea, and diarrhea. Less common but serious adverse events might include fever, joint pain, and elevated liver enzymes. The articles indicate that these side effects are generally manageable with dose modifications or supportive care.`;
    } else if (userMessage.toLowerCase().includes('trial') || userMessage.toLowerCase().includes('study')) {
      responseContent = `The BEACON CRC study is the most significant clinical trial investigating treatments for ${searchResult.query}. This Phase 3 randomized trial evaluated the efficacy of encorafenib plus cetuximab with or without binimetinib. The trial enrolled 665 patients and demonstrated significant improvement in overall survival, objective response rate, and progression-free survival compared to the control arm.`;
    } else if (userMessage.toLowerCase().includes('mechanism') || userMessage.toLowerCase().includes('how does')) {
      responseContent = `BRAF V600E mutation leads to constitutive activation of the MAPK pathway, promoting uncontrolled cell growth. BRAF inhibitors (like encorafenib) block this mutated protein, but when used alone in colorectal cancer, feedback reactivation of EGFR can occur. That's why combination with an EGFR inhibitor (cetuximab) is necessary to achieve optimal therapeutic efficacy by blocking this escape mechanism.`;
    } else {
      responseContent = `Based on the articles I've analyzed about ${searchResult.query}, I found that this is a clinically significant mutation present in about 8-12% of colorectal cancer cases. It's associated with poor prognosis when treated with standard therapies, but targeted approaches combining BRAF and EGFR inhibition have shown improved outcomes. Would you like more specific information about the treatments, clinical trials, or molecular mechanisms?`;
    }

    const botMessage: Message = {
      id: Date.now().toString(),
      content: responseContent,
      role: 'assistant',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 w-80 sm:w-96 h-[500px] z-50 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      <div className="bg-gradient-to-r from-insight-500 to-insight-600 text-white p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Research Assistant</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-insight-600/40 rounded"
          aria-label="Close chatbot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-insight-100 text-insight-800 ml-auto' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
            >
              <div className="flex items-start mb-1">
                {message.role === 'assistant' && <Bot className="h-4 w-4 mr-1 mt-0.5 text-insight-600" />}
                {message.role === 'user' && <User className="h-4 w-4 mr-1 mt-0.5 text-insight-600" />}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {message.role === 'assistant' ? 'AI Assistant' : 'You'} • {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-insight-600" />
                <p className="text-sm">AI is typing...</p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the results..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isTyping}
            className="bg-insight-500 hover:bg-insight-600 text-white"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPanel;
