import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function PdfSplitterPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">PDF Splitter</CardTitle>
          <CardDescription>
            This tool is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Construction className="h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">Coming Soon!</p>
          <p className="mt-2 text-muted-foreground">
            We're working hard to bring you this feature. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
