import { Link } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function MarkdownContent({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => <h1 className="text-lg font-bold my-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-md font-semibold my-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-base font-medium my-1" {...props} />,
        p: ({ node, ...props }) => <p className="my-1" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-1" {...props} />,
        li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
        a: ({ node, ...props }) => (
          <div className="flex items-center">
            <a className="hover:underline" {...props} />
            <Link className="ml-1 h-3 w-3" />
          </div>
        ),
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-4" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic" {...props} />
        ),
        code: ({ node, ...props }) => (
          <code className="bg-gray-100 dark:bg-gray-800 rounded px-1" {...props} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
