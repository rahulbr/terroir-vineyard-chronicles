
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const VineyardChatbot: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Simulate loading
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call an API to get a response
      // For now, we'll simulate a response with vineyard-related information
      setTimeout(() => {
        const responses = [
          "Based on the current GDD accumulation, your vine phenology appears to be progressing ahead of schedule compared to last year.",
          "The recent weather patterns suggest optimal conditions for flowering. Monitor closely over the next week.",
          "Your Cabernet blocks are showing excellent development. Consider adjusting canopy management if the warm weather continues.",
          "Based on historical data and current conditions, harvest is projected for early October, approximately 6 days earlier than last year.",
          "Powdery mildew risk is currently moderate. Consider preventative measures if humidity increases in the next 48 hours."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: randomResponse
        }]);
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error getting response:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-vineyard-gold" />
            Vineyard Assistant
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 h-48 overflow-y-auto flex flex-col space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Ask me anything about your vineyard's health, growth stages, or recommendations.</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user' 
                        ? 'bg-vineyard-burgundy/10 self-end' 
                        : 'bg-vineyard-leaf/10 self-start'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="bg-vineyard-leaf/10 self-start rounded-lg p-3 max-w-[80%]">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-vineyard-leaf rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-vineyard-leaf rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-vineyard-leaf rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about vineyard conditions, growth stages, or recommendations..."
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vineyard-leaf focus:border-transparent"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-vineyard-leaf hover:bg-vineyard-leaf/80"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
