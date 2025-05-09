'use client'
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import classNames from "classnames";
import { Newspaper, Volleyball, Flag, Film, Wifi, Briefcase } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const categories = ["All", "Sports", "Politics", "Entertainment", "Technology", "Business"];

const NewsCard = ({ id, heading, summary, date, place, category }: { id: string; heading: string; summary: string; date: string; place: string; category: string; }) => {
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

export default function NewsHome({ categoryParam }: { categoryParam?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathCategory = decodeURIComponent(categoryParam || "");

  const initialCategory = categories.includes(pathCategory.charAt(0).toUpperCase() + pathCategory.slice(1))
    ? pathCategory.charAt(0).toUpperCase() + pathCategory.slice(1)
    : "All";

  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [newsData, setNewsData] = useState<any[]>([]);

  const totalPages = Math.ceil(newsData.length / ITEMS_PER_PAGE);
  const paginatedNews = newsData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const endpoint = `http://localhost:5000/${selectedCategory.toLowerCase()}`;

        const res = await fetch(endpoint);
        const data = await res.json();
        setNewsData(data);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setNewsData([]);
      }
    };

    fetchNews();
  }, [selectedCategory]);

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
              variant={selectedCategory === cat ? "default" : "ghost"}
              className="text-md h-full font-medium hover:underline hover:text-black"
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
                router.push(cat === "All" ? "/" : `/${cat.toLowerCase()}`);
              }}
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
              key={news._id}
              id={news._id}
              heading={news.title}
              summary={news.summary}
              date={news.date}
              place={news.location}
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
