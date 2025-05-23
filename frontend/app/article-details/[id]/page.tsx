'use client'
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CircleAlert, Send } from "lucide-react";
import classNames from "classnames";
import { Newspaper, Volleyball, Flag, Film, Wifi, Briefcase } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Report } from "./components/report";

const conversation = [
  { sender: "user", text: "what is the news about" },
  { sender: "bot", text: "News states the new policy made by government" },
  { sender: "user", text: "what is the news about" },
  { sender: "bot", text: "News states the new policy made by government" },
  { sender: "user", text: "what is the news about" },
  { sender: "bot", text: "News states the new policy made by government" },
  { sender: "user", text: "what is the news about" },
  { sender: "bot", text: "News states the new policy made by government" },
  { sender: "user", text: "what is the news about" },
  { sender: "bot", text: "News states the new policy made by government" },
  { sender: "user", text: "explain" },
  { sender: "bot", text: "new policy will empower education in rural regions through subsidy in educational material" }
];

const categories = ["All", "Sports", "Politics", "Entertainment", "Technology", "Business"];

function CategoryIcon({ category, size = 24 }: { category: string; size?: number }) {
  const iconSize = size;
  switch (category) {
    case "All": return <Newspaper size={iconSize} />;
    case "Sports": return <Volleyball size={iconSize} />;
    case "Politics": return <Flag size={iconSize} />;
    case "Entertainment": return <Film size={iconSize} />;
    case "Technology": return <Wifi size={iconSize} />;
    case "Business": return <Briefcase size={iconSize} />;
    default: return <Newspaper size={iconSize} />;
  }
}

export default function ArticleDetail() {
  const { id } = useParams();
  const [scrolled, setScrolled] = useState(false);
  const [article, setArticle] = useState({ title: '', content: '', last_updated:'', category: 'All' });
  const router = useRouter();
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

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleCategoryClick = (category) => {
    router.push(`/${category.toLowerCase()}`);
  };
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`http://localhost:5000/${id}`);
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        console.error("Failed to fetch article:", err);
      }
    }
    if (id) fetchArticle();
  }, [id]);
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="text-center mb-6 flex flex-col justify-center max-w-3xl">
        <div className={classNames("flex items-end mb-2", scrolled ? " fixed top-0 left-0 w-full z-50 bg-white shadow-md py-2 px-4 justify-center" : "justify-between")}>
          <h1
            onClick={handleHomeClick}
            className={classNames(
              "font-serif font-bold transition-transform text-gray-800 cursor-pointer", 
              scrolled ? "transform-none text-2xl mr-3" : "transform translate-y-0 text-4xl"
            )}
            style={{ fontFamily: 'Old English Text MT, serif' }}
          >
            The Unbiased Report
          </h1>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleCategoryClick(article.category)}>
            <div className={classNames("h-8 border-l-3 mx-4 border-gray-500", scrolled ? "" : "")}></div>
            <span style={{ fontFamily: "Tahoma, sans-serif" }} >{article.category}</span>
            <CategoryIcon category={article.category} size={18}/>
          </div>
        </div>
        <div className={"border-t-3 my-4 border-gray-500"}></div>
      </div>

      {/* Article Content */}
      <section className="mb-6">
        <h2 className={`text-2xl font-semibold mb-2`}>{article.title}</h2>
        <p className="text-md text-gray-800 leading-relaxed mb-2">
          {article.content}
        </p>
        <div className="flex justify-between text-sm text-gray-500">
          
          <div className="flex items-center gap-2">
            <span>{getTime(article.last_updated)}</span>
            <Separator className="mx-2" orientation="vertical" />
            <span>{getDate(article.last_updated)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Report />
          </div>
        </div>
      </section>
      {/* Conversation */}
      <Separator className="my-6" />
      <section className="mb-28 space-y-4">
        {conversation.map((msg, index) => (
          <div key={index} className={classNames("px-4 py-2 rounded-lg w-fit max-w-[80%]", msg.sender === "user" ? "bg-gray-100 self-end ml-auto" : "border self-start mr-auto")}> 
            <p className="text-sm text-gray-900">{msg.text}</p>
          </div>
        ))}
      </section>

      <section className="fixed bottom-2 left-0 right-0 bg-white border rounded-lg px-4 py-2 flex items-center gap-2 max-w-3xl mx-auto">
        <Textarea placeholder="Ask..." rows={1} className="flex-1 shadow-none max-h-[100px] resize-none border-0 focus:ring-0 focus-visible:ring-0" />
        <Button variant="ghost" size="icon" className="cursor-pointer text-gray-600 hover:text-black" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
          <Send className="h-5 w-5" />
        </Button>
      </section>
    </main>
  );
}
