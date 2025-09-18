
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AppName, ShareIcon } from '@/lib/constants';
import { Check, Copy } from 'lucide-react';

interface ShareButtonProps {
  toolName: string;
}

export function ShareButton({ toolName }: ShareButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (navigator.share) {
      setIsSupported(true);
    } else {
      setShowCopy(true);
    }
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: `${toolName} | ${AppName}`,
      text: `Check out this awesome ${toolName} tool on ${AppName}!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to copy if user cancels share dialog
        if ((error as DOMException).name !== 'AbortError') {
            handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
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
  }

  return (
    <Button onClick={handleShare} variant="outline" size="sm">
      {showCopy ? <Copy className="mr-2 h-4 w-4" /> : <ShareIcon className="mr-2 h-4 w-4" />}
      {showCopy ? 'Copy Link' : 'Share'}
    </Button>
  );
}
