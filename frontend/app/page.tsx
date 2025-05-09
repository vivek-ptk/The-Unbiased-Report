'use client'
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import classNames from "classnames";
import { Newspaper, Volleyball, Flag, Film, Wifi, Briefcase } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import NewsHome from "@/app/components/NewsHome";

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
  
  return (
     <NewsHome categoryParam="All" />
  );
}
