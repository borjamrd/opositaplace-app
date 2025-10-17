import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export default function CopyToClipboard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="flex items-start text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 p-2 rounded-md w-fit">
      <span className="mr-4">{text}</span>
      <Button
        onClick={handleCopy}
        variant="ghost"
        size="icon"
        className="p-0 h-full w-fit aspect-square ms-auto"
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  );
}
