import React from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  onSuccess?: () => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  url = window.location.href,
  onSuccess
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        onSuccess?.();
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
        onSuccess?.();
      } catch (err) {
        console.warn('Clipboard write failed', err);
      }
    }
  };

  return (
    <button
      className="btn-icon"
      onClick={handleShare}
      aria-label="Share word information"
      title="Share"
    >
      <Share2 size={20} />
    </button>
  );
};
