import { Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareDialogProps {
  questionIndex: number;
}

export function ShareDialog({ questionIndex }: ShareDialogProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?q=${questionIndex}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Friends App - Question',
          text: 'Check out this question!',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Link copied!',
        description: 'Share link has been copied to clipboard',
      });
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="absolute bottom-4 left-4 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this question</DialogTitle>
          <DialogDescription>
            Share this question with your friends. They'll see the exact same question when they open the link.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button onClick={handleShare} className="w-full">
            Share Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
