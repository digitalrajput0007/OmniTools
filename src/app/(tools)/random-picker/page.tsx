'use client';

import { useState, useEffect } from 'react';
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
import { RefreshCw, Ticket, Trophy, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Confetti from 'react-dom-confetti';
import { Input } from '@/components/ui/input';

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

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function RandomPickerPage() {
  const [items, setItems] = useState('Alice\nBob\nCharlie\nDiana\nEthan\nFiona');
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [winners, setWinners] = useState<(string | null)[]>([]);
  const [pickingFor, setPickingFor] = useState<number | null>(null);
  const [showConfettiFor, setShowConfettiFor] = useState<number | null>(null);
  const [rouletteItem, setRouletteItem] = useState<string | null>(null);
  const [numberOfWinners, setNumberOfWinners] = useState(1);
  const [isSetup, setIsSetup] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    if (isSetup) {
      const itemList = items.split('\n').map(item => item.trim()).filter(Boolean);
      setAvailableItems(itemList);
    }
  }, [items, isSetup]);

  const handleSetup = () => {
     const itemList = items.split('\n').map(item => item.trim()).filter(Boolean);
     if (itemList.length < numberOfWinners) {
        toast({
            title: 'Not Enough Items',
            description: `You need at least ${numberOfWinners} items to pick from.`,
            variant: 'destructive',
        });
        return;
    }
    setAvailableItems(itemList);
    setWinners(Array(numberOfWinners).fill(null));
    setIsSetup(false);
  }

  const handlePickWinner = (index: number) => {
    if (availableItems.length === 0) {
      toast({
        title: 'No Items Left',
        description: 'All items have been picked.',
        variant: 'destructive',
      });
      return;
    }

    setPickingFor(index);
    setShowConfettiFor(null);

    let picks = 0;
    const maxPicks = 20 + Math.floor(Math.random() * 10);
    const interval = setInterval(() => {
      setRouletteItem(availableItems[Math.floor(Math.random() * availableItems.length)]);
      picks++;
      if (picks > maxPicks) {
        clearInterval(interval);
        const winnerIndex = Math.floor(Math.random() * availableItems.length);
        const finalWinner = availableItems[winnerIndex];
        
        setWinners(prev => {
            const newWinners = [...prev];
            newWinners[index] = finalWinner;
            return newWinners;
        });
        setAvailableItems(prev => prev.filter((_, i) => i !== winnerIndex));

        setRouletteItem(finalWinner);
        setPickingFor(null);
        setShowConfettiFor(index);
      }
    }, 100);
  };

  const handleReset = () => {
    setItems('Alice\nBob\nCharlie\nDiana\nEthan\nFiona');
    setAvailableItems([]);
    setWinners([]);
    setPickingFor(null);
    setShowConfettiFor(null);
    setRouletteItem(null);
    setNumberOfWinners(1);
    setIsSetup(true);
  };

  const allWinnersPicked = winners.length > 0 && winners.every(w => w !== null);

  const renderSetup = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="items-list">Enter items (one per line)</Label>
            <Textarea
                id="items-list"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                className="min-h-[200px]"
                placeholder="Alice\nBob\nCharlie\nDiana"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="number-of-winners">Number of Winners</Label>
            <Input
                id="number-of-winners"
                type="number"
                value={numberOfWinners}
                onChange={(e) => setNumberOfWinners(Math.max(1, parseInt(e.target.value, 10)))}
                min="1"
            />
        </div>
        <Button onClick={handleSetup} className="w-full">
            <UserPlus className="mr-2" /> Set Up Drawing
        </Button>
    </div>
  );

  const renderDrawing = () => (
    <div>
        <div className="mb-6 rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Drawing Pool</h3>
            <p className="text-sm text-muted-foreground">{availableItems.length} items remaining</p>
            <div className="mt-2 flex flex-wrap gap-2">
                {availableItems.map((item, i) => (
                    <span key={i} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{item}</span>
                ))}
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {winners.map((winner, index) => (
                <Card key={index} className={cn("relative overflow-hidden transition-all", winner && "border-green-500")}>
                    <CardHeader>
                        <CardTitle>{getOrdinal(index + 1)} Place</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-4 text-center min-h-[120px]">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Confetti active={showConfettiFor === index} config={confettiConfig} />
                        </div>
                        
                        {winner ? (
                             <>
                                <Trophy className="h-10 w-10 text-yellow-500" />
                                <p className="text-2xl font-bold font-headline">{winner}</p>
                            </>
                        ) : pickingFor === index ? (
                            <p className="text-2xl font-bold font-headline blur-sm transition-all duration-100">{rouletteItem}</p>
                        ) : (
                           <Button onClick={() => handlePickWinner(index)} disabled={pickingFor !== null}>
                                <Ticket className="mr-2" /> Pick Winner
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
        
         {allWinnersPicked && (
            <div className="mt-6 flex justify-center">
                 <Button onClick={handleReset} variant="outline" size="lg">
                    <RefreshCw className="mr-2" /> Start New Drawing
                </Button>
            </div>
        )}
    </div>
  );


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Random Winner Picker</CardTitle>
          <CardDescription>
            Set up your drawing, and pick winners one by one. Good luck!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSetup ? renderSetup() : renderDrawing()}
        </CardContent>
      </Card>
    </div>
  );
}
