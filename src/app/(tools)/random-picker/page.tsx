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
import { ScrollArea } from '@/components/ui/scroll-area';

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

const rankStyles = [
    "md:col-span-2 min-h-[160px]", // 1st
    "md:col-span-2 min-h-[140px]", // 2nd
    "md:col-span-2 min-h-[120px]", // 3rd
];

const getRankStyle = (index: number) => {
    return rankStyles[index] || "md:col-span-2 min-h-[110px]";
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
  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isSetup) {
      const itemList = items.split('\n').map(item => item.trim()).filter(Boolean);
      setAvailableItems(itemList);
      setWinners(Array(numberOfWinners > 0 ? numberOfWinners : 1).fill(null));
    }
  }, [items, isSetup, numberOfWinners]);

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
    <div className="mx-auto max-w-lg space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Setup Your Drawing</CardTitle>
                <CardDescription>Enter the items to draw from and how many winners to pick.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        onChange={(e) => setNumberOfWinners(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        min="1"
                    />
                </div>
                 <Button onClick={handleSetup} className="w-full" size="lg">
                    <UserPlus className="mr-2" /> Start Drawing
                </Button>
            </CardContent>
        </Card>
    </div>
  );

  const renderDrawing = () => (
    <div className='space-y-8'>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
             <div className="flex flex-col gap-4 md:col-span-2">
                 {winners.map((winner, index) => (
                    <Card key={index} className={cn("relative flex flex-col overflow-hidden transition-all", getRankStyle(index), winner && "border-green-500 bg-green-500/5")}>
                        <CardHeader>
                            <CardTitle className="text-muted-foreground">{getOrdinal(index + 1)} Place</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-grow flex-col items-center justify-center space-y-4 text-center">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <Confetti active={showConfettiFor === index} config={confettiConfig} />
                            </div>
                            
                            {winner ? (
                                <>
                                    <Trophy className={cn("text-yellow-500", index === 0 ? "h-10 w-10" : "h-8 w-8")} />
                                    <p className={cn("font-bold font-headline", index === 0 ? "text-3xl" : "text-2xl")}>{winner}</p>
                                </>
                            ) : pickingFor === index ? (
                                <p className="text-3xl font-bold font-headline blur-sm transition-all duration-100">{rouletteItem}</p>
                            ) : (
                               <Button onClick={() => handlePickWinner(index)} disabled={pickingFor !== null} size="lg" className='w-full max-w-xs'>
                                    <Ticket className="mr-2" /> Pick Winner
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="md:col-span-1 h-fit">
                <CardHeader>
                    <CardTitle>Drawing Pool</CardTitle>
                    <CardDescription>{availableItems.length} items remaining</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96">
                        <div className="flex flex-col gap-2">
                            {availableItems.map((item, i) => (
                                <div key={i} className="rounded-md border bg-secondary/30 px-3 py-2 text-sm text-secondary-foreground">{item}</div>
                            ))}
                             {availableItems.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No items left!</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
        
         {(allWinnersPicked || availableItems.length === 0) && (
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
          {isClient && (isSetup ? renderSetup() : renderDrawing())}
        </CardContent>
      </Card>
    </div>
  );
}
