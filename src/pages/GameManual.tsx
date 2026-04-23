import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import manualContent from '../../GAME_MANUAL.md?raw';

export const GameManual: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-background">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <header className="flex gap-3 items-center py-6 shrink-0">
          <button
            onClick={() => navigate('/game')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="返回游戏"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">游戏说明</h1>
        </header>

        {/* Markdown Content */}
        <div className="pb-16 prose prose-sm max-w-none dark:prose-invert
          prose-headings:font-bold
          prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6
          prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-8 prose-h2:border-b prose-h2:border-border prose-h2:pb-1
          prose-h3:text-base prose-h3:mb-2 prose-h3:mt-5
          prose-p:text-sm prose-p:leading-relaxed prose-p:text-foreground/90
          prose-li:text-sm prose-li:text-foreground/90
          prose-table:text-sm
          prose-th:bg-muted prose-th:px-3 prose-th:py-1.5
          prose-td:px-3 prose-td:py-1.5
          prose-strong:text-foreground
          prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-xs
          prose-hr:border-border
        ">
          <ReactMarkdown
          rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
        >{manualContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
