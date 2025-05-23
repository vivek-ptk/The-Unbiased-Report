'use client';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

type Article = {
  source: string; // e.g., "NDTV"
  url: string;
};

type SourcesDialogProps = {
  latestArticles: Article[];
  allArticles: Article[];
};

function SourceLink({ source, url }: Article) {
  const imagePath = `/source-logos/${source}.png`; // Make sure images exist in /public/source-logos/
  return (
    <TooltipProvider delayDuration={1000}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            <Image
              src={imagePath}
              alt={source}
              width={20}
              height={20}
              className="rounded-sm"
            />
            <span>{source}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-white text-black border border-gray-300 flex items-center gap-2 rounded-md p-2">
          <Image
            src={imagePath}
            alt={source}
            width={20}
            height={20}
            className="rounded-sm"
          />
          <p>{url}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  // return (
  //   <li className="flex items-center space-x-3">
  //     <Image src={imagePath} alt={source} width={24} height={24} className="rounded-sm" />
  //     <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
  //       {source}
  //     </a>
  //   </li>
  // );
}

export default function SourcesDialog({ latestArticles, allArticles }: SourcesDialogProps) {
  
  console.log("latestArticles", latestArticles);
  console.log("allArticles", allArticles);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className='cursor-pointer'><span>Sources</span><ExternalLink/></Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="text-xl font-semibold mb-4">Sources</DialogTitle>

        {
          latestArticles.length !== allArticles.length ? (
            <div>
              <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Latest Articles</h3>
              <div className="flex items-center justify-center gap-2 space-y-2 w-full flex-wrap max-h-48 overflow-y-auto">
                {latestArticles.length != 0 && latestArticles.map((article, index) => (
                  <SourceLink key={`latest-${index}`} {...article} />
                ))}
              </div>
            </div>
    
            <div>
              <h3 className="text-lg font-medium mb-2">All Articles</h3>
              <div className="flex items-center justify-center gap-2 space-y-2 w-full flex-wrap max-h-48 overflow-y-auto">
                {allArticles.length != 0 && allArticles.map((article, index) => (
                  <SourceLink key={`all-${index}`} {...article} />
                ))}
              </div>
            </div>
            </div>
        )
        :
        (
          <div className="flex items-center justify-center gap-2 space-y-2 w-full flex-wrap max-h-48 overflow-y-auto">
            {allArticles.length != 0 && allArticles.map((article, index) => (
              <SourceLink key={`all-${index}`} {...article} />
            ))}
          </div>
        )
        }
      </DialogContent>
    </Dialog>
  );
}
