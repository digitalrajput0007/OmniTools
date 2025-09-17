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
    "min-h-[60px]", // 1st
    "min-h-[54px]", // 2nd
    "min-h-[48px]", // 3rd
];

const getRankStyle = (index: number) => {
    return rankStyles[index] || "min-h-[48px]";
}


export default function RandomPickerPage() {
  const [items, setItems] = useState('Alice\nBob\nCharlie\nDiana');
  const [prizes, setPrizes] = useState('');
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [winners, setWinners] = useState<(string | null)[]>([]);
  const [winnerLabels, setWinnerLabels] = useState<string[]>([]);
  const [pickingFor, setPickingFor] = useState<number | null>(null);
  const [showConfettiFor, setShowConfettiFor] = useState<number | null>(null);
  const [rouletteItem, setRouletteItem] = useState<string | null>(null);
  const [numberOfWinners, setNumberOfWinners] = useState<number | ''>(1);
  const [isSetup, setIsSetup] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const itemList = items.split('\n').map(item => item.trim()).filter(Boolean);
  const prizeList = prizes.split('\n').map(item => item.trim()).filter(Boolean);

  const handleSetup = () => {
    const winnerCount = prizeList.length > 0 ? prizeList.length : (Number(numberOfWinners) || 0);

    if (prizeList.length === 0 && winnerCount < 1) {
       toast({
          title: 'Invalid Number of Winners',
          description: `Please enter at least 1 winner.`,
          variant: 'destructive',
      });
      return;
    }

    if (itemList.length < winnerCount) {
      toast({
          title: 'Not Enough Items',
          description: `You need at least ${winnerCount} participants to draw ${winnerCount} winners.`,
          variant: 'destructive',
      });
      return;
    }
    
    setAvailableItems(itemList);
    
    if (prizeList.length > 0) {
      setWinnerLabels(prizeList);
      setWinners(Array(prizeList.length).fill(null));
    } else {
      const numWinners = Number(numberOfWinners);
      setWinnerLabels(Array.from({ length: numWinners }, (_, i) => `${getOrdinal(i + 1)} Place`));
      setWinners(Array(numWinners).fill(null));
    }
    
    setIsSetup(false);
  }

  const handlePickWinner = (index: number) => {
    const currentAvailable = availableItems.filter(item => !winners.includes(item));
    if (currentAvailable.length === 0) {
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
      setRouletteItem(currentAvailable[Math.floor(Math.random() * currentAvailable.length)]);
      picks++;
      if (picks > maxPicks) {
        clearInterval(interval);
        const winnerIndex = Math.floor(Math.random() * currentAvailable.length);
        const finalWinner = currentAvailable[winnerIndex];
        
        setWinners(prev => {
            const newWinners = [...prev];
            newWinners[index] = finalWinner;
            return newWinners;
        });
        setAvailableItems(prev => prev.filter(item => item !== finalWinner));

        setRouletteItem(finalWinner);
        setPickingFor(null);
        setShowConfettiFor(index);
      }
    }, 100);
  };

  const handleReset = () => {
    setIsSetup(true);
    setShowConfettiFor(null);
    setPickingFor(null);
    setWinners([]);
    setWinnerLabels([]);
  };

  const allWinnersPicked = !isSetup && winners.length > 0 && winners.every(w => w !== null);

  const renderLeftColumn = () => {
    if (isSetup) {
      return (
        <Card>
          <CardHeader>
              <CardTitle>Setup Your Drawing</CardTitle>
              <CardDescription>Enter items and prizes or number of winners to begin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="items-list">Participants (one per line)</Label>
                  <Textarea
                      id="items-list"
                      value={items}
                      onChange={(e) => setItems(e.target.value)}
                      className="min-h-[150px]"
                      placeholder="Alice\nBob\nCharlie\nDiana"
                  />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="prizes-list">Prizes (one per line, optional)</Label>
                  <Textarea
                      id="prizes-list"
                      value={prizes}
                      onChange={(e) => setPrizes(e.target.value)}
                      className="min-h-[80px]"
                      placeholder="Grand Prize\n2nd Prize\n3rd Prize"
                  />
                  <p className="text-xs text-muted-foreground">If filled, this overrides "Number of Winners".</p>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="number-of-winners">Number of Winners</Label>
                  <Input
                      id="number-of-winners"
                      type="number"
                      value={numberOfWinners}
                      onChange={(e) => setNumberOfWinners(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      min="1"
                      placeholder="Enter a number"
                      disabled={prizeList.length > 0}
                  />
              </div>
               <Button onClick={handleSetup} className="w-full" size="lg" disabled={itemList.length === 0}>
                  <UserPlus className="mr-2" /> Start Drawing
              </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className='space-y-4'>
        {winners.map((winner, index) => (
          <Card key={index} className={cn("relative flex flex-col overflow-hidden transition-all", getRankStyle(index), winner && "border-green-500 bg-green-500/5")}>
              <CardHeader className="py-2">
                  <CardTitle className="text-sm text-muted-foreground">{winnerLabels[index]}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-grow flex-col items-center justify-center space-y-2 text-center py-2">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Confetti active={showConfettiFor === index} config={confettiConfig} />
                  </div>
                  
                  {winner ? (
                      <div className="flex items-center gap-2">
                          <Trophy className={cn("text-yellow-500", index === 0 ? "h-6 w-6" : "h-5 w-5")} />
                          <p className={cn("font-bold font-headline", index === 0 ? "text-xl" : "text-lg")}>{winner}</p>
                      </div>
                  ) : pickingFor === index ? (
                      <p className="text-xl font-bold font-headline blur-sm transition-all duration-100">{rouletteItem}</p>
                  ) : (
                     <Button onClick={() => handlePickWinner(index)} disabled={pickingFor !== null || !!winners[index]} size="sm" className='w-full max-w-xs'>
                          <Ticket className="mr-2 h-4 w-4" /> Pick Winner
                      </Button>
                  )}
              </CardContent>
          </Card>
        ))}
        {(allWinnersPicked || (availableItems.length === 0 && !isSetup)) && (
          <div className="mt-2 flex justify-center">
               <Button onClick={handleReset} variant="outline" size="lg">
                  <RefreshCw className="mr-2" /> Start New Drawing
              </Button>
          </div>
        )}
      </div>
    );
  }

  const renderRightColumn = () => {
    const list = isSetup ? itemList : availableItems;
    const title = "Drawing Pool";
    const description = `${list.length} participant${list.length === 1 ? '' : 's'} ${isSetup ? 'entered' : 'remaining'}`;
    
    return (
       <Card className="h-fit sticky top-20">
          <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
              <ScrollArea className="h-[calc(100vh-20rem)]">
                  <div className="flex flex-col gap-2">
                      {list.map((item, i) => (
                          <div key={i} className="rounded-md border bg-secondary/30 px-3 py-2 text-sm text-secondary-foreground">{item}</div>
                      ))}
                       {list.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No items in the pool.</p>}
                  </div>
              </ScrollArea>
          </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Random Winner Picker</CardTitle>
          <CardDescription>
            Set up your drawing, pick winners one by one, and see who's lucky!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isClient ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderLeftColumn()}
              {renderRightColumn()}
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Card>
                    <CardHeader><CardTitle>Setup Your Drawing</CardTitle></CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='h-[150px] bg-muted rounded-md animate-pulse' />
                      <div className='h-[80px] bg-muted rounded-md animate-pulse' />
                      <div className='h-[40px] bg-muted rounded-md animate-pulse' />
                      <div className='h-[44px] bg-muted rounded-md animate-pulse' />
                    </CardContent>
                  </Card>
                </div>
                 <div>
                  <Card>
                    <CardHeader><CardTitle>Drawing Pool</CardTitle></CardHeader>
                    <CardContent>
                      <div className='h-[calc(100vh-20rem)] bg-muted rounded-md animate-pulse' />
                    </CardContent>
                  </Card>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
