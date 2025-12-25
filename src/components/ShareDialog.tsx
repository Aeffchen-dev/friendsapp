import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareDialogProps {
  questionIndex: number;
  questionText?: string;
}

export function ShareDialog({ questionIndex, questionText }: ShareDialogProps) {
  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('q', questionText ? questionText : String(questionIndex));
    const shareUrl = url.toString();
    
    const shareText = `Ich spiele gerade die Friends App und wollte dir diese Frage schicken:\n\n„${questionText}"`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Friends App',
          text: shareText,
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
      className="absolute bottom-8 z-30 hover:opacity-70 transition-opacity flex items-center gap-2"
      style={{ left: '4rem' }}
      onClick={handleShare}
    >
      <Upload className="w-6 h-6 text-white" />
      <span className="text-white text-[16px]">Frage verschicken</span>
    </button>
  );
}
