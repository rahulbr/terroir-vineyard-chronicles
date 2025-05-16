
import React, { useState } from 'react';
import { 
  Sheet,
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BertinChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BertinChatbot: React.FC<BertinChatbotProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md flex flex-col h-full p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="/lovable-uploads/1daa92e5-43fc-4934-83d5-63bf3b385ecb.png" alt="Bertin" />
              <AvatarFallback>BT</AvatarFallback>
            </Avatar>
            Bertin
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 overflow-y-auto flex flex-col space-y-3">
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
          </div>
        </div>
        
        <div className="p-4 border-t mt-auto">
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
      </SheetContent>
    </Sheet>
  );
};
