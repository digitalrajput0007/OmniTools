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
          <CardTitle className="font-headline">Unit Converter</CardTitle>
          <CardDescription>
            Convert between length, weight, temperature, and more.
          </CardDescription>
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
    </div>
  );
}
