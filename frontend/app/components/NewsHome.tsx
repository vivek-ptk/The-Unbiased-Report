'use client'
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import classNames from "classnames";
import { Newspaper, Volleyball, Flag, Film, Wifi, Briefcase, Menu, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";

const categories = ["All", "Sports", "Politics", "Entertainment", "Technology", "Business"];

const NewsCard = ({ id, heading, summary, date, time, category }: { id: string; heading: string; summary: string; date: string; time:string; category: string; }) => {
  const router = useRouter();
  return (
    <Card className="rounded-none shadow-md p-4 mb-4 cursor-pointer" onClick={() => router.push(`/article-details/${id}`)}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className={`text-xl font-semibold mb-2`}>{heading}</h2>
          <CategoryIconSmall category={category} />
        </div>
        <p className="text-md text-gray-800 mb-4 leading-relaxed line-clamp-6">{summary}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{date}</span>
          <span>{time}</span>
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
  const selectedTabRef = useRef(null);
  useEffect(() => {
    selectedTabRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center", // or "nearest" or "start"
      block: "nearest",
    });
  }, []);

  const initialCategory = categories.includes(pathCategory.charAt(0).toUpperCase() + pathCategory.slice(1))
    ? pathCategory.charAt(0).toUpperCase() + pathCategory.slice(1)
    : "All";

  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleHomeClick = () => {
    router.push('/');
  };
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${selectedCategory.toLowerCase()}?page=${page}&limit=10`;
        setLoading(true);
        const res = await fetch(endpoint);
        const data = await res.json();
        setNewsData(data.results);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setNewsData([]);
        setTotalPages(0);
        setLoading(false);
      }
    };
  
    fetchNews();
  }, [selectedCategory, page]);

  function getDate(input) {
    const parsed = new Date(input);
    if (!isNaN(parsed)) {
      return parsed.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
  
  function getTime(input) {
    const parsed = new Date(input);
    if (!isNaN(parsed)) {
      return parsed.toTimeString().split(' ')[0]; // HH:MM:SS
    }
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 max-md:py-5 ">
  <div
    className={classNames(
      "transition-transform duration-100 bg-white w-full max-md:flex max-md:items-end max-md:justify-center",
      scrolled
        ? "fixed top-0 left-0 w-full z-50 bg-white shadow-md py-2 px-4 flex items-end justify-center"
        : "text-center mb-6 flex flex-col justify-center",
      menuOpen ? "max-md:flex-col justify-start" : ""
    )}
    style={{ fontFamily: "Tahoma, sans-serif" }}
  >
    <div className="flex items-center justify-center w-auto max-md:justify-between max-md:w-full">
      <h1
        onClick={handleHomeClick}
        className={classNames(
          `font-serif font-bold w-fit text-nowrap transition-transform text-gray-800 cursor-pointer`,
          scrolled ? "text-2xl text-left mb-1" : "text-left text-4xl max-md:text-3xl max-sm:text-3xl",
        )}
        style={{ fontFamily: '"Old English Text MT", serif' }}
      >
        The Unbiased Report
      </h1>

      {/* Mobile Hamburger */}
      {
        scrolled && 
        (<button
          className="md:hidden p-2 ml-4"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>)
      }
    </div>

    <div
      className={classNames(
        !scrolled
          ? "border-t-3 mt-4 border-gray-500"
          : "h-8 mb-1 border-r-3 mx-4 border-gray-500 max-md:hidden",
      )}
    />

    {/* Nav - show on md+ OR if mobile menu is open */}
    {/* <div className="p-2 w-full max-md:w-auto"> */}
    <nav
      className={classNames(
        "flex gap-4 transition-transform mt-2 w-full scroll-smooth",
          scrolled ? "justify-center max-md:flex-wrap !w-fit" : " mb-8 max-md:mb-0 border-b border-gray-300",
          !scrolled || menuOpen ? "" : "hidden",
          "md:flex md:flex-row md:justify-center max-md:overflow-x-auto max-md:w-full",
        )}
        style={{
          scrollbarWidth: 'none',           // Firefox
          msOverflowStyle: 'none',          // IE 10+
        }}
    >

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <div
            className="hover:bg-gray-100 h-full group flex flex-col items-center cursor-pointer  md:mb-0"
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              // setMenuOpen(true);
              setPage(1);
              router.push(cat === "All" ? "/" : `/${cat.toLowerCase()}`);
              // setMenuOpen(true); // close mobile menu on selection
            }}
            ref={isSelected ? selectedTabRef : null}
          >
            <Button
              variant={"ghost"}
              className={classNames(
                "text-md h-full font-medium hover:text-black pointer-events-none",
                scrolled && isSelected ? "bg-muted" : ""
              )}
            >
              <CategoryIcon category={cat} />
              <span>{cat}</span>
            </Button>
            <div
              className={classNames(
                "w-full h-0.5 transition-colors",
                isSelected
                  ? "border-b-2 border-black"
                  : "border-b-2 border-transparent group-hover:border-gray-500",
                scrolled ? "hidden" : "block"
              )}
            />
          </div>
        );
      })}
    </nav>
    {/* </div> */}
  </div>

  {/* Content Section */}
  <div className={scrolled ? "pt-32" : ""}>
    {loading ? (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Spinner show={true} />
      </div>
    ) : newsData.length > 0 ? (
      newsData.map((item) => (
        <NewsCard
          key={item._id}
          id={item._id}
          heading={item.title}
          summary={item.content}
          date={getDate(item.last_updated)}
          time={getTime(item.last_updated)}
          category={item.category}
        />
      ))
    ) : (
      <div className="text-center text-gray-500 mt-8">
        No news articles found for this category.
      </div>
    )}

    {totalPages > ITEMS_PER_PAGE && (
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          className="cursor-pointer"
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
          className="cursor-pointer"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    )}
  </div>
</main>
  );
}
