
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AppName, ShareIcon } from '@/lib/constants';
import { Copy, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SharePromptProps {
  toolName: string;
  className?: string;
}

export function SharePrompt({ toolName, className }: SharePromptProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: `${toolName} | ${AppName}`,
      text: `Check out this awesome ${toolName} tool on ${AppName}! It's free and easy to use.`,
      url: window.location.href,
    };

    // Always try to use the Web Share API first.
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // The share was successful, so we don't need to do anything else.
        return;
      } catch (error) {
        // If the user cancels the share dialog, do nothing.
        // If another error occurs, we will fall back to copying the link.
        if ((error as DOMException).name === 'AbortError') {
          return;
        }
        console.error('Web Share API failed:', error);
      }
    }
    
    // Fallback for browsers that do not support Web Share API or if it fails.
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: 'Link Copied!',
        description: 'You can now share it with anyone.',
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: 'Error',
        description: `Could not copy the link.`,
        variant: 'destructive',
      });
    });
  };


  return (
    <Card className={cn("w-full bg-secondary/30", className)}>
        <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 text-center">
            <Gift className="h-8 w-8 text-primary shrink-0" />
            <div className='flex-grow'>
                <p className="font-semibold">Found this tool useful?</p>
                <p className="text-sm text-muted-foreground">Share it with your friends and colleagues!</p>
            </div>
             <Button onClick={handleShare} size="sm">
                <ShareIcon className="mr-2 h-4 w-4" />
                Share Tool
            </Button>
        </CardContent>
    </Card>
  );
}
