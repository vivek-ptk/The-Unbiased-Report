import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import classNames from "classnames";

const categories = ["All", "Sports", "Politics", "Entertainment", "Technology", "Business"];

const NewsCard = ({ heading, summary, date, place }: { heading: string; summary: string; date: string; place: string }) => (
  <Card className="rounded-xl shadow-md p-4 mb-4">
    <CardContent className="p-0">
      <h2 className="text-xl font-semibold mb-2">{heading}</h2>
      <p className="text-md text-gray-800 mb-4 leading-relaxed">{summary}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{date}</span>
        <span>{place}</span>
      </div>
    </CardContent>
  </Card>
);

const dummyNews = Array.from({ length: 45 }, (_, i) => ({
  heading: `Sample News Heading ${i + 1}`,
  summary: `This is a sample summary for news item ${i + 1}. It contains brief details about the news topic.`,
  date: `2025-05-08`,
  place: `Location ${i + 1}`,
}));

const ITEMS_PER_PAGE = 10;

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
          scrolled ? "fixed top-0 left-0 w-full z-50 bg-white shadow-md py-2 px-4 flex items-end" : "text-center mb-6 flex flex-col justify-center"
        )}
      >
        <h1
          className={classNames(
            "font-serif font-bold transition-transform ",
            scrolled ? "text-lg text-left" : "text-3xl"
          )}
        >
          The Unbiased Report
        </h1>

        <nav
          className={classNames(
            "flex flex-wrap gap-4 justify-center transition-transform mt-2",
            scrolled ? "justify-start" : "mb-8 border-b border-gray-300 pb-2"
          )}
        >
          {categories.map((cat) => (
            <Button
              key={cat}
              variant="ghost"
              className="text-md font-medium hover:underline hover:text-black"
            >
              {cat}
            </Button>
          ))}
        </nav>
      </div>

      <div className={scrolled ? "pt-32" : ""}>
        <section>
          {paginatedNews.map((news, idx) => (
            <NewsCard
              key={idx}
              heading={news.heading}
              summary={news.summary}
              date={news.date}
              place={news.place}
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
