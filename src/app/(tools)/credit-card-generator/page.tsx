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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, RefreshCw, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type CardType = 'visa' | 'mastercard' | 'amex' | 'discover';

const cardInfo = {
  visa: {
    name: 'VISA',
    prefix: '4',
    length: 16,
    color: 'from-blue-500 to-blue-700',
    logo: (
      <svg viewBox="0 0 76 24" className="h-8 fill-white">
        <path d="M48.43,18.06h3.1c1.8,0,3.31-1.33,3.31-3.69,0-2.6-1.78-3.71-3.6-3.71h-2.1v7.4Zm-.03-2.19v-3.07h2.15c.87,0,1.45.64,1.45,1.5,0,.86-.53,1.57-1.5,1.57h-2.1Zm9.67-5.27h-2.48l-2.73,7.4h2.53l.42-1.28h2.09l.24,1.28h2.38L58.07,10.6ZM56.32,15l.7-3.6.7,3.6H56.32Zm-11-4.42,1.83-4.75h2.6L52,18.06h-2.43l-1.83-4.75-1.83,4.75h-2.4L41.3,5.85h2.6l1.83,4.79ZM38,5.85,34.48,18.06H32.05l-1.07-3.4-.23-1v-.1a4.62,4.62,0,0,1,1.53-3.65l3.4-3.66L38,5.85Zm-5.32,8.69.57-1.85a4,4,0,0,0-2.3-3.32l-1.4-1.07L26.78,18h2.58l1.32-4.32ZM25.33,18.06H22.6c-1.3,0-2.18-.32-2.58-1.55l3.23-8.66h2.7L25.33,18.06Z" />
        <path d="M12.8,11.83a3.52,3.52,0,0,0-3.38-2.6C6.7,9.23,5,10.7,5,13.25a3.17,3.17,0,0,0,1.38,2.83,6.1,6.1,0,0,0,4.1,1.15c2.4,0,4.35-.6,4.35-.6V13.8A3.19,3.19,0,0,1,12.8,11.83Zm-1.4,3a1.59,1.59,0,0,1-1.93.4,1.59,1.59,0,0,1-.5-1.85,1.47,1.47,0,0,1,1.88-.43,1.45,1.45,0,0,1,.55,1.88Z" />
        <path d="M22.06,11.33c0-2.08-2.3-2.6-3.83-2.85-.9-.15-1.23-.33-1.23-.67s.35-.58,1-.58a2.53,2.53,0,0,1,1.75.6l.83-1.7a4.34,4.34,0,0,0-2.63-.8c-2,0-3.53.9-3.53,2.45,0,1.8,2,2.33,3.55,2.6.93.18,1.23.3,1.23.68,0,.4-.45.63-1.15.63a3,3,0,0,1-2.13-1l-.8,1.7a4.7,4.7,0,0,0,3,.95c2.1,0,3.73-1,3.73-2.55Z" />
      </svg>
    ),
  },
  mastercard: {
    name: 'Mastercard',
    prefix: '5',
    length: 16,
    color: 'from-gray-700 to-gray-900',
    logo: (
      <svg viewBox="0 0 1000 618" className="h-8">
        <circle cx="309" cy="309" r="309" fill="#EB001B" />
        <circle cx="691" cy="309" r="309" fill="#F79E1B" />
        <path d="M500 309a309 309 0 0 1-191-277.6 309 309 0 0 0 0 555.2A309 309 0 0 1 500 309z" fill="#FF5F00" />
      </svg>
    ),
  },
  amex: {
    name: 'American Express',
    prefix: '3',
    length: 15,
    color: 'from-blue-400 to-blue-600',
    logo: <span className="text-xl font-semibold text-white">AMEX</span>,
  },
  discover: {
    name: 'Discover',
    prefix: '6',
    length: 16,
    color: 'from-orange-400 to-orange-600',
    logo: (
       <svg viewBox="0 0 24 24" className="h-8 w-auto fill-white">
        <path d="M12.352 4.23c-4.582 0-8.312 3.66-8.312 8.163s3.73 8.165 8.312 8.165c4.583 0 8.313-3.662 8.313-8.165s-3.73-8.163-8.313-8.163zm.185 14.168c-1.895 0-2.18-.89-2.19-1.42h-1.636c.038 1.517 1.48 2.505 3.826 2.505 2.112 0 3.825-1.047 3.825-2.73 0-1.576-1.127-2.31-2.91-2.65-.953-.17-1.27-.378-1.27-.723 0-.306.32-.572.934-.572.633 0 1.01.287 1.085.64h1.56c-.056-1.303-1.21-2.074-2.69-2.074-2.072 0-3.37 1.047-3.37 2.447 0 1.34 1.05 2.055 2.67 2.368 1.146.21 1.54.493 1.54.88 0 .493-.574.76-1.17.76z" />
      </svg>
    )
  },
};


// Luhn algorithm implementation
function luhnCheck(num: string): boolean {
    let arr = num.split('').map((c, i) => {
        let n = parseInt(c, 10);
        return (num.length - i) % 2 === 0 ? (n * 2 > 9 ? n * 2 - 9 : n * 2) : n;
    });
    return arr.reduce((acc, val) => acc + val, 0) % 10 === 0;
}

function generateLuhnNumber(prefix: string, length: number): string {
  let ccNumber = prefix;
  while (ccNumber.length < length - 1) {
    ccNumber += Math.floor(Math.random() * 10);
  }

  let sum = 0;
  let doubleUp = false;
  for (let i = ccNumber.length - 1; i >= 0; i--) {
    let curDigit = parseInt(ccNumber.charAt(i));
    if (doubleUp) {
      curDigit *= 2;
      if (curDigit > 9) {
        curDigit -= 9;
      }
    }
    sum += curDigit;
    doubleUp = !doubleUp;
  }
  
  const checkDigit = (sum * 9) % 10;
  return ccNumber + checkDigit;
}

export default function CreditCardGeneratorPage() {
  const [cardType, setCardType] = useState<CardType>('visa');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: 'John Doe',
    expiry: '',
    cvv: '',
  });

  const { toast } = useToast();

  const generateCard = () => {
    const { prefix, length } = cardInfo[cardType];
    const number = generateLuhnNumber(prefix, length);

    const expiryMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const currentYear = new Date().getFullYear();
    const expiryYear = String(currentYear + Math.floor(Math.random() * 5) + 2).slice(-2);

    const cvvLength = cardType === 'amex' ? 4 : 3;
    const cvv = Array.from({ length: cvvLength }, () => Math.floor(Math.random() * 10)).join('');

    setCardDetails({
      number,
      name: 'John Doe',
      expiry: `${expiryMonth}/${expiryYear}`,
      cvv,
    });
  };
  
  // Generate a card on initial load and when card type changes
  useEffect(() => {
    generateCard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardType]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to Clipboard',
        description: `${fieldName} copied.`,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: 'Error',
        description: `Could not copy ${fieldName}.`,
        variant: 'destructive',
      });
    });
  };
  
  const formatCardNumber = (number: string) => {
    if (cardType === 'amex') {
      return number.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    }
    return number.replace(/(.{4})/g, '$1 ').trim();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardDescription className="text-base">
            Create valid-looking, but fake, credit card numbers for testing and validation purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center">
              <div className={cn("w-full max-w-sm rounded-xl p-6 text-white shadow-lg space-y-6 relative overflow-hidden bg-gradient-to-br", cardInfo[cardType].color)}>
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10"></div>
                <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-white/5"></div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light uppercase">Credit Card</span>
                  {cardInfo[cardType].logo}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-light text-white/80">Card Number</Label>
                  <p className="font-mono text-xl tracking-wider">{formatCardNumber(cardDetails.number)}</p>
                </div>
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <Label className="text-xs font-light text-white/80">Card Holder</Label>
                      <p className="font-medium">{cardDetails.name}</p>
                    </div>
                     <div className="space-y-1 text-right">
                      <Label className="text-xs font-light text-white/80">Expires</Label>
                      <p className="font-mono text-lg">{cardDetails.expiry}</p>
                    </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="card-type">Card Network</Label>
                <Select value={cardType} onValueChange={(v) => setCardType(v as CardType)}>
                  <SelectTrigger id="card-type">
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className='flex-1'>
                       <Label className="text-xs text-muted-foreground">Card Number</Label>
                       <p className="font-mono text-sm">{cardDetails.number}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(cardDetails.number, 'Card Number')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                   <div className="flex items-center justify-between gap-4">
                     <div className='flex-1'>
                       <Label className="text-xs text-muted-foreground">Expiry Date</Label>
                       <p className="font-mono text-sm">{cardDetails.expiry}</p>
                     </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(cardDetails.expiry, 'Expiry Date')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                   <div className="flex items-center justify-between gap-4">
                    <div className='flex-1'>
                       <Label className="text-xs text-muted-foreground">CVV</Label>
                       <p className="font-mono text-sm">{cardDetails.cvv}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(cardDetails.cvv, 'CVV')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={generateCard} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Card
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the Dummy Credit Card Generator</CardTitle>
          <CardDescription>
            Understand the purpose and technology behind generating test credit card numbers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>What are Dummy Credit Card Numbers?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Dummy credit card numbers are fake numbers that look real but carry no actual value. They are designed exclusively for testing and validation purposes in development environments, such as e-commerce checkout forms or payment gateway integrations.
                </p>
                <p>
                  <strong>Important:</strong> These numbers are not linked to any real bank accounts and cannot be used to make actual purchases. They are mathematically valid according to the Luhn algorithm, but will be rejected by any real payment processor.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How Does It Work? (The Luhn Algorithm)</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  Our generator creates card numbers that conform to the Luhn algorithm (also known as the "modulus 10" or "mod 10" algorithm). This is a simple checksum formula used by major credit card companies to validate card numbers at the point of entry.
                </p>
                <ol className="list-decimal list-inside space-y-2 pt-2">
                  <li>It starts with a valid prefix for the selected card network (e.g., '4' for Visa).</li>
                  <li>It generates random digits for the main body of the number.</li>
                  <li>It calculates a final "check digit" based on the Luhn formula and appends it to the end.</li>
                  <li>This process ensures the generated number passes the initial format validation used by many online forms.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Developers and Testers</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Testing Form Validation:</strong> Use these numbers to test your UI logic, such as input formatting (e.g., adding spaces), error messages for invalid formats, and card network detection.</li>
                  <li><strong>Sandbox Environments:</strong> When testing payment gateways like Stripe or Braintree, use their specific, documented test card numbers. While our generated numbers are valid, payment gateways often have their own set for triggering specific responses (e.g., "card declined").</li>
                  <li><strong>Do Not Use in Production:</strong> Never attempt to use these numbers for real transactions. They are for testing and demonstration only.</li>
                  <li><strong>Randomize Your Tests:</strong> Click "Generate New Card" to get a fresh set of details (number, expiry, CVV) for each test case to ensure your system handles different inputs correctly.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
