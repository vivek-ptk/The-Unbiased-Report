'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import classNames from "classnames";
import { Newspaper, Volleyball, Flag, Film, Wifi, Briefcase } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const categories = ["All", "Sports", "Politics", "Entertainment", "Technology", "Business"];

const NewsCard = ({ id, heading, summary, date, place, category }: { id: number; heading: string; summary: string; date: string; place: string; category: string; }) => {
  const router = useRouter();
  return (
    <Card className="rounded-xl shadow-md p-4 mb-4 cursor-pointer" onClick={() => router.push(`/article-details/${id}`)}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between ">
          <h2 className={`text-xl font-semibold mb-2`}>{heading}</h2>
          <CategoryIconSmall category={category} />
        </div>
        <p className="text-md text-gray-800 mb-4 leading-relaxed">{summary}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{date}</span>
          <span>{place}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const dummyNews = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  heading: `Sample News Heading ${i + 1}`,
  summary: `This is a sample summary for news item ${i + 1}. It contains brief details about the news topic.`,
  date: `2025-05-08`,
  place: `Location ${i + 1}`,
  category: categories[i % categories.length],
}));

const ITEMS_PER_PAGE = 10;

function CategoryIcon({ category, size = 24 }: { category: string; size?: number }) {
  const iconSize = size;
  switch (category) {
    case "All":
      return <Newspaper size={iconSize} />;
    case "Sports":
      return <Volleyball size={iconSize} />;
    case "Politics":
      return <Flag size={iconSize} />;
    case "Entertainment":
      return <Film size={iconSize} />;
    case "Technology":
      return <Wifi size={iconSize} />;
    case "Business":
      return <Briefcase size={iconSize} />;
    default:
      return <Newspaper size={iconSize} />;
  }
}

function CategoryIconSmall({ category }: { category: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-sm"><CategoryIcon category={category} size={16} /></div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{category}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function Home() {
  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  const totalPages = Math.ceil(dummyNews.length / ITEMS_PER_PAGE);
  const paginatedNews = dummyNews.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <div
        className={classNames(
          "transition-transform duration-100",
          scrolled ? "fixed top-0 left-0 w-full z-50 bg-white shadow-md py-2 px-4 flex items-end justify-center" : "text-center mb-6 flex flex-col justify-center"
        )}
        style={{ fontFamily: "Tahoma, sans-serif" }}
      >

        <h1
          className={classNames(
            `font-serif font-bold transition-transform text-gray-800`,
            scrolled ? "text-2xl text-left mb-1" : "text-4xl"
          )}
          style={{ fontFamily: '"Old English Text MT", serif' }}
        >
          The Unbiased Report
        </h1>
        <div className={classNames(!scrolled ? "border-t-3 mt-4 border-gray-500" : "h-8 mb-1 border-r-3 mx-4 border-gray-500")}></div>
        <nav
          className={classNames(
            "flex flex-wrap gap-4 justify-center transition-transform mt-2 ",
            scrolled ? "justify-start " : "mb-8 border-b border-gray-300 pb-2"
          )}
        >
          {categories.map((cat) => (
            <Button
              key={cat}
              variant="ghost"
              className="text-md h-full font-medium hover:underline hover:text-black"
            >
              <CategoryIcon category={cat} />
              <span>{cat}</span>
            </Button>
          ))}
        </nav>
      </div>

      <div className={scrolled ? "pt-32" : ""}>
        <section>
          {paginatedNews.map((news) => (
            <NewsCard
              key={news.id}
              id={news.id}
              heading={news.heading}
              summary={news.summary}
              date={news.date}
              place={news.place}
              category={news.category}
            />
          ))}
        </section>

        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </main>
  );
}
