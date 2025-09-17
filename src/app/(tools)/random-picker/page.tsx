'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Ticket, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import Confetti from 'react-dom-confetti';

const confettiConfig = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

export default function RandomPickerPage() {
  const [items, setItems] = useState('');
  const [winner, setWinner] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rouletteItem, setRouletteItem] = useState<string | null>(null);

  const { toast } = useToast();

  const handlePickWinner = () => {
    const itemList = items.split('\n').map(item => item.trim()).filter(Boolean);

    if (itemList.length < 2) {
      toast({
        title: 'Not Enough Items',
        description: 'Please enter at least two items to choose from.',
        variant: 'destructive',
      });
      return;
    }

    setIsPicking(true);
    setWinner(null);
    setShowConfetti(false);

    let picks = 0;
    const maxPicks = 20 + Math.floor(Math.random() * 10);
    const interval = setInterval(() => {
      setRouletteItem(itemList[Math.floor(Math.random() * itemList.length)]);
      picks++;
      if (picks > maxPicks) {
        clearInterval(interval);
        const finalWinner = itemList[Math.floor(Math.random() * itemList.length)];
        setWinner(finalWinner);
        setRouletteItem(finalWinner);
        setIsPicking(false);
        setShowConfetti(true);
      }
    }, 100);
  };

  const handleReset = () => {
    setItems('');
    setWinner(null);
    setIsPicking(false);
    setShowConfetti(false);
    setRouletteItem(null);
  };

  const isFinished = winner !== null;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Random Picker</CardTitle>
          <CardDescription>
            Enter a list of items and let fate decide the winner!
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <Label htmlFor="items-list">Enter items (one per line)</Label>
            <Textarea
              id="items-list"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              className="min-h-[300px]"
              placeholder="Alice\nBob\nCharlie\nDiana"
              disabled={isPicking || isFinished}
            />
             <div className="flex gap-2">
              <Button 
                onClick={handlePickWinner} 
                disabled={isPicking || isFinished} 
                className="w-full"
              >
                <Ticket className="mr-2" /> Pick a Winner
              </Button>
              {isFinished && (
                <Button onClick={handleReset} variant="outline" className="w-full">
                  <RefreshCw className="mr-2" /> Start Over
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center space-y-6 rounded-lg bg-muted/50 p-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
               <Confetti active={showConfetti} config={confettiConfig} />
            </div>
           
            {!isPicking && !isFinished && (
               <div className="text-center text-muted-foreground">
                <Ticket className="mx-auto h-16 w-16" />
                <p className="mt-4 text-lg">Waiting for items...</p>
                <p className="text-sm">Your winner will be displayed here.</p>
              </div>
            )}
            
            {(isPicking || isFinished) && (
              <div className="text-center">
                 <p className="text-sm uppercase text-muted-foreground mb-4">
                  {isFinished ? "And the winner is..." : "Picking a winner..."}
                </p>
                <div 
                  className={cn(
                    "text-4xl font-bold font-headline transition-all duration-100", 
                    isPicking ? "blur-sm scale-95 opacity-50" : "blur-0 scale-100 opacity-100"
                  )}
                  style={{ minHeight: '60px' }}
                >
                  {rouletteItem}
                </div>
              </div>
            )}

            {isFinished && (
              <div className="text-center pt-6">
                <Trophy className="mx-auto h-12 w-12 text-yellow-500" />
                <p className="mt-2 font-semibold text-lg">Congratulations!</p>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
