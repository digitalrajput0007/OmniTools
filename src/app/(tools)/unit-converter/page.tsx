
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShareButton } from '@/components/ui/share-button';

type UnitCategory = 'length' | 'weight' | 'temperature';

const conversions = {
  length: {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    mile: 1609.34,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
  },
  weight: {
    gram: 1,
    kilogram: 1000,
    milligram: 0.001,
    pound: 453.592,
    ounce: 28.3495,
  },
  temperature: {
    celsius: (v: number) => v,
    fahrenheit: (v: number) => v * 1.8 + 32,
    kelvin: (v: number) => v + 273.15,
  },
  temperatureFromBase: {
    // to celsius
    celsius: (v: number) => v,
    fahrenheit: (v: number) => (v - 32) / 1.8,
    kelvin: (v: number) => v - 273.15,
  },
};

const unitLabels: Record<UnitCategory, string[]> = {
  length: Object.keys(conversions.length),
  weight: Object.keys(conversions.weight),
  temperature: Object.keys(conversions.temperature),
};

export default function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('foot');
  const [fromValue, setFromValue] = useState('1');
  const [toValue, setToValue] = useState('');

  const handleCategoryChange = (newCategory: UnitCategory) => {
    setCategory(newCategory);
    const newUnits = unitLabels[newCategory];
    setFromUnit(newUnits[0]);
    setToUnit(newUnits[1] || newUnits[0]);
    setFromValue('1');
  };

  useEffect(() => {
    const fromValNum = parseFloat(fromValue);
    if (isNaN(fromValNum)) {
      setToValue('');
      return;
    }

    let result;
    if (category === 'temperature') {
      const fromFunc =
        conversions.temperatureFromBase[
          fromUnit as keyof typeof conversions.temperatureFromBase
        ];
      const toFunc =
        conversions.temperature[toUnit as keyof typeof conversions.temperature];
      const baseValue = fromFunc(fromValNum);
      result = toFunc(baseValue);
    } else {
      const conv = conversions[category];
      const fromFactor = conv[fromUnit as keyof typeof conv];
      const toFactor = conv[toUnit as keyof typeof conv];
      const baseValue = fromValNum * fromFactor;
      result = baseValue / toFactor;
    }
    setToValue(result.toFixed(4).replace(/\.0+$/, ''));
  }, [fromValue, fromUnit, toUnit, category]);

  const handleFromValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromValue(e.target.value);
  };

  const swapUnits = () => {
    const tempFromUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempFromUnit);
    setFromValue(toValue);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex w-full items-center justify-between gap-4">
            <div className="text-center flex-1">
              <CardTitle className="text-2xl">Unit Converter</CardTitle>
              <CardDescription className="text-base">
                Convert between length, weight, temperature, and more.
              </CardDescription>
            </div>
            <ShareButton toolName="Unit Converter" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => handleCategoryChange(v as UnitCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="length">Length</SelectItem>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            <div className="w-full space-y-2">
              <Label>From</Label>
              <Input
                type="number"
                value={fromValue}
                onChange={handleFromValueChange}
              />
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitLabels[category].map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="mt-6 self-center"
              onClick={swapUnits}
            >
              <ArrowRightLeft className="h-5 w-5" />
            </Button>

            <div className="w-full space-y-2">
              <Label>To</Label>
              <Input
                type="number"
                value={toValue}
                readOnly
                className="bg-muted/50 font-bold"
              />
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitLabels[category].map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the Unit Converter</CardTitle>
          <CardDescription>
            A guide to understanding and using different units of measurement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Why Use a Unit Converter?</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>
                  In a globalized world, we constantly encounter different systems of measurement. A unit converter is an essential tool for students, travelers, cooks, scientists, and professionals who need to quickly and accurately translate measurements from one system to another (e.g., metric to imperial). Our tool eliminates manual calculations and potential errors.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to Use the Unit Converter</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Select a Category:</strong> Start by choosing the type of measurement you want to convert, such as Length, Weight, or Temperature.</li>
                  <li><strong>Enter Your Value:</strong> Type the number you want to convert into the "From" input field.</li>
                  <li><strong>Choose Your Units:</strong> Select the starting unit (e.g., meters) from the "From" dropdown and the target unit (e.g., feet) from the "To" dropdown.</li>
                  <li><strong>Get Instant Results:</strong> The converted value will automatically appear in the "To" field as you type. No need to click a button!</li>
                  <li><strong>Swap Units:</strong> Click the swap icon (<ArrowRightLeft />) to instantly switch the "From" and "To" units and values.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Measurement Tips</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Temperature is Different:</strong> Unlike length and weight, temperature scales (Celsius, Fahrenheit, Kelvin) don't have a simple multiplicative relationship. Our converter uses the correct specific formulas for accurate temperature conversions.</li>
                  <li><strong>Metric vs. Imperial:</strong> The metric system (meters, grams) is used by most of the world and is based on powers of ten, making it easy to scale. The imperial system (feet, pounds) is primarily used in the United States.</li>
                  <li><strong>Precision:</strong> Our tool calculates to four decimal places for accuracy, but you can round the result as needed for your specific application.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
