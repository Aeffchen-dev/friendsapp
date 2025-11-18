import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareDialogProps {
  questionIndex: number;
}

export function ShareDialog({ questionIndex }: ShareDialogProps) {
  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <button
      className="absolute bottom-8 z-30 hover:opacity-70 transition-opacity"
      style={{ left: '4rem' }}
      onClick={handleShare}
    >
      <Send className="w-6 h-6 text-white" />
    </button>
  );
}
