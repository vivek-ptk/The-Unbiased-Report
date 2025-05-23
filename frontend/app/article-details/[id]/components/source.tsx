'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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
    <li className="flex items-center space-x-3">
      <Image src={imagePath} alt={source} width={24} height={24} className="rounded-sm" />
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        {source}
      </a>
    </li>
  );
}

export default function SourcesDialog({ latestArticles, allArticles }: SourcesDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Sources</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Sources</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Latest Articles</h3>
          <ul className="space-y-2">
            {latestArticles.length != 0 && latestArticles.map((article, index) => (
              <SourceLink key={`latest-${index}`} {...article} />
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">All Articles</h3>
          <ul className="space-y-2">
            {allArticles.length != 0 && allArticles.map((article, index) => (
              <SourceLink key={`all-${index}`} {...article} />
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
