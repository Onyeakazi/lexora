import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  onCopied?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label,
  onCopied
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy', err);
    }
  };

  return (
    <button
      className="btn-icon"
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      title="Copy"
      style={{ width: label ? 'auto' : undefined, padding: label ? '0 0.75rem' : undefined }}
    >
      {copied ? <Check size={18} color="var(--color-accent)" /> : <Copy size={18} />}
      {label && <span style={{ marginLeft: '0.4rem', fontSize: '0.85rem' }}>{copied ? 'Copied' : label}</span>}
    </button>
  );
};
