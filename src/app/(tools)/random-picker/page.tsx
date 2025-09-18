
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
import { RefreshCw, Ticket, Trophy, UserPlus, Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Confetti from 'react-dom-confetti';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShareButton } from '@/components/ui/share-button';

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
    "min-h-[4rem]", // 1st
    "min-h-[3.75rem]", // 2nd
    "min-h-[3.5rem]", // 3rd
];

const getRankStyle = (index: number) => {
    return rankStyles[index] || "min-h-[3.5rem]";
}

export default function RandomPickerPage() {
  const [items, setItems] = useState('Alice\nBob\nCharlie\nDiana\nEthan\nFiona');
  const [prizes, setPrizes] = useState('');
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [winners, setWinners] = useState<(string | null)[]>([]);
  const [winnerLabels, setWinnerLabels] = useState<string[]>([]);
  
  const [isPicking, setIsPicking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
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
  const nextWinnerIndex = winners.findIndex(w => w === null);
  const currentLabel = nextWinnerIndex !== -1 ? winnerLabels[nextWinnerIndex] : '';

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
          description: `You need at least ${itemList.length} participants to draw for ${winnerCount} prize(s)/winner(s).`,
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

  const handlePickWinner = () => {
    if (nextWinnerIndex === -1) return;

    const currentAvailable = availableItems.filter(item => !winners.includes(item));
    if (currentAvailable.length === 0) {
      toast({
        title: 'No Items Left',
        description: 'All items have been picked.',
        variant: 'destructive',
      });
      return;
    }

    setIsPicking(true);
    setShowConfetti(false);
    setRouletteItem(currentAvailable[0]);

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
            newWinners[nextWinnerIndex] = finalWinner;
            return newWinners;
        });
        setAvailableItems(prev => prev.filter(item => item !== finalWinner));
        setRouletteItem(finalWinner);
setIsPicking(false);
        setShowConfetti(true);
      }
    }, 100);
  };

  const handleReset = () => {
    setIsSetup(true);
    setShowConfetti(false);
    setIsPicking(false);
    setWinners([]);
    setWinnerLabels([]);
  };

  const allWinnersPicked = !isSetup && winners.length > 0 && winners.every(w => w !== null);

  const renderContent = () => {
    if (isSetup) {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
              <CardTitle>Setup Your Drawing</CardTitle>
              <CardDescription>Enter participants and prizes to begin. Add one item per line.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="items-list">Participants ({itemList.length})</Label>
                    <Textarea
                        id="items-list"
                        value={items}
                        onChange={(e) => setItems(e.target.value)}
                        className="min-h-[200px]"
                        placeholder="Alice\nBob\nCharlie\nDiana"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="prizes-list">Prizes (Optional, {prizeList.length})</Label>
                    <Textarea
                        id="prizes-list"
                        value={prizes}
                        onChange={(e) => setPrizes(e.target.value)}
                        className="min-h-[200px]"
                        placeholder="Grand Prize\n2nd Prize\n3rd Prize"
                    />
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="number-of-winners">Number of Winners</Label>
                  <Input
                      id="number-of-winners"
                      type="number"
                      value={numberOfWinners}
                      onChange={(e) => setNumberOfWinners(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      min="1"
                      placeholder="Enter a number if not using prizes"
                      disabled={prizeList.length > 0}
                  />
                  <p className="text-xs text-muted-foreground">The prize list will override this number if it's filled out.</p>
              </div>
               <Button onClick={handleSetup} className="w-full" size="lg" disabled={itemList.length === 0}>
                  <UserPlus className="mr-2" /> Start Drawing
              </Button>
          </CardContent>
        </Card>
      );
    }

    // --- Drawing View ---
    const lastWinner = winners[nextWinnerIndex - 1] || winners[winners.length - 1];

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <Card className="text-center overflow-hidden relative">
                <CardContent className="p-6 min-h-[12rem] flex flex-col items-center justify-center gap-2">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Confetti active={showConfetti} config={confettiConfig} />
                    </div>
                    {isPicking ? (
                        <>
                            <p className="text-sm text-muted-foreground font-medium">Picking the winner for...</p>
                            <p className="text-xl font-bold">{currentLabel}</p>
                            <p className="text-3xl font-bold font-headline blur-sm transition-all duration-100">{rouletteItem}</p>
                        </>
                    ) : lastWinner && !allWinnersPicked ? (
                         <>
                            <p className="text-sm text-muted-foreground font-medium">{winnerLabels[nextWinnerIndex-1]} Winner:</p>
                            <Sparkles className="h-8 w-8 text-yellow-400" />
                            <p className="text-4xl font-bold font-headline">{lastWinner}</p>
                        </>
                    ) : allWinnersPicked ? (
                        <>
                           <Trophy className="h-10 w-10 text-yellow-400" />
                           <p className="text-2xl font-bold font-headline">Drawing Complete!</p>
                           <p className="text-muted-foreground">All winners have been picked.</p>
                        </>
                    ) : (
                         <>
                            <p className="text-sm text-muted-foreground font-medium">Ready to draw for...</p>
                            <p className="text-2xl font-bold font-headline">{currentLabel}</p>
                        </>
                    )}
                </CardContent>
                <CardHeader className="p-4 border-t">
                    {!allWinnersPicked ? (
                        <Button onClick={handlePickWinner} size="lg" disabled={isPicking}>
                            <Ticket className="mr-2 h-5 w-5" />
                            {isPicking ? 'Picking...' : `Pick ${currentLabel} Winner`}
                        </Button>
                    ) : (
                        <Button onClick={handleReset} variant="secondary" size="lg">
                            <RefreshCw className="mr-2" /> Start New Drawing
                        </Button>
                    )}
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {winners.some(w => w !== null) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" /> Winners</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="flex flex-col gap-2">
                            {winners.map((winner, index) => winner && (
                                <div key={index} className="flex items-center justify-between rounded-md border bg-secondary/30 px-3 py-2 text-sm text-secondary-foreground">
                                    <span className="font-semibold">{winnerLabels[index]}:</span>
                                    <span className="font-medium">{winner}</span>
                                </div>
                            ))}
                           </div>
                        </CardContent>
                    </Card>
                )}
                
                <Card className={cn(winners.some(w => w !== null) ? "" : "md:col-span-2")}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> Drawing Pool</CardTitle>
                         <CardDescription>{availableItems.length} participant{availableItems.length !== 1 ? 's' : ''} remaining</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-60">
                            <div className="flex flex-col gap-2">
                                {availableItems.map((item, i) => (
                                    <div key={i} className="rounded-md border bg-secondary/30 px-3 py-2 text-sm text-secondary-foreground">{item}</div>
                                ))}
                                {availableItems.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">The pool is empty!</p>}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex w-full items-center justify-between gap-4">
            <div className="text-center flex-1">
              <CardTitle className="text-2xl">Random Picker</CardTitle>
              <CardDescription className="text-base">
                A fun and easy way to pick random winners for giveaways, contests, and more.
              </CardDescription>
            </div>
            <ShareButton toolName="Random Picker" />
          </div>
        </CardHeader>
        <CardContent>
          {isClient ? renderContent() : (
             <div className="flex justify-center items-center h-96">
                <div className='w-full max-w-2xl h-96 bg-muted rounded-md animate-pulse' />
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the Random Picker</CardTitle>
          <CardDescription>
            Make your selections fair, fun, and transparent with our easy-to-use tool.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is a Random Picker?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  A random picker is a tool that impartially selects one or more items from a given list. It's the digital equivalent of drawing names from a hat. This ensures that every item in the list has an equal chance of being chosen, making it a fair way to run contests, giveaways, drawings, or even make decisions.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the Random Picker</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Enter Participants:</strong> In the "Participants" box, list all the names or items you want to include in the drawing. Make sure to put each one on a new line.</li>
                  <li><strong>Set Prizes or Winners:</strong> You have two options:
                    <ul className="list-disc list-inside pl-4 mt-1">
                      <li>Enter specific prize names (e.g., "Grand Prize") in the "Prizes" box. The number of prizes will determine the number of winners.</li>
                      <li>Alternatively, leave prizes blank and simply enter the "Number of Winners" you want to draw.</li>
                    </ul>
                  </li>
                  <li><strong>Start the Drawing:</strong> Click the "Start Drawing" button to move to the main event screen.</li>
                  <li><strong>Pick a Winner:</strong> Click the "Pick Winner" button. A fun animation will run, and the winner will be revealed with a confetti celebration! The winner is removed from the pool for subsequent drawings.</li>
                  <li><strong>Reset:</strong> Once all winners are picked, you can click "Start New Drawing" to reset the tool with the same list of participants.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Your Drawing</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Build Suspense:</strong> The "roulette" animation is great for building excitement during a live event or screen-sharing session.</li>
                  <li><strong>Prizes vs. Places:</strong> Using the "Prizes" field allows you to assign specific awards (e.g., "Signed T-Shirt," "First Choice"). If you just need a ranked list, use the "Number of Winners" field, which will assign ordinal places (1st, 2nd, 3rd, etc.).</li>
                  <li><strong>One Entry Per Line:</strong> Ensure there are no blank lines between entries in the participant list, as this can affect the drawing pool. The tool automatically ignores empty lines and trims whitespace.</li>
                  <li><strong>No Repeats:</strong> Once an item is picked as a winner, it is automatically removed from the drawing pool, so it cannot be chosen again.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
