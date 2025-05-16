
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export const NoteChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: 'Hello! I can help you analyze vineyard notes and data. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Simulate bot response with a delay
    setTimeout(() => {
      let botResponse = '';
      
      // Simple pattern matching for demonstration
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('flowering') || lowerInput.includes('flower')) {
        botResponse = 'Based on our notes, flowering has reached 85% in Block A (Pinot Noir), 70% in Block B (Chardonnay), and is progressing well in other blocks despite the slightly cooler temperatures this year.';
      } else if (lowerInput.includes('harvest') || lowerInput.includes('yield')) {
        botResponse = 'Last year\'s harvest yielded 3.7 tons per acre on average. Block A had the highest yield at 4.2 tons per acre. The harvest dates were between September 15-28, with Pinot Noir being harvested first.';
      } else if (lowerInput.includes('disease') || lowerInput.includes('pest')) {
        botResponse = 'We\'ve detected some early signs of powdery mildew in Block C, which has been treated with organic sulfur on May 10th. Other blocks are currently disease-free, but we should continue monitoring as humidity levels are increasing.';
      } else if (lowerInput.includes('weather') || lowerInput.includes('temperature')) {
        botResponse = 'Recent temperature has averaged 75°F during the day and 52°F at night. We\'ve had 1.2 inches of rainfall in the last 30 days, which is about 15% below the seasonal average. The growing degree days (GDD) accumulation is currently at 527.';
      } else {
        botResponse = 'I don\'t have specific information on that topic in my current dataset. Would you like me to search through historical notes or suggest some related insights?';
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
    }, 1500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Vineyard Insights Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 h-[500px] overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={cn(
              "flex items-start gap-2",
              message.role === 'bot' ? "" : "flex-row-reverse"
            )}>
              {message.role === 'bot' ? (
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarFallback className="bg-vineyard-burgundy text-white">AI</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarImage src="/images/david.jpg" alt="User" />
                  <AvatarFallback>DG</AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                "rounded-lg p-3 max-w-[80%]",
                message.role === 'bot' 
                  ? "bg-muted text-foreground" 
                  : "bg-vineyard-burgundy text-white"
              )}>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8 mt-0.5">
                <AvatarFallback className="bg-vineyard-burgundy text-white">AI</AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 bg-muted">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-foreground/30 rounded-full animate-pulse" />
                  <div className="h-2 w-2 bg-foreground/30 rounded-full animate-pulse delay-150" />
                  <div className="h-2 w-2 bg-foreground/30 rounded-full animate-pulse delay-300" />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Ask about vineyard notes, data, or insights..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <Button 
            type="submit" 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={!input.trim() || loading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
