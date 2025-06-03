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
import SourcesDialog, {  } from "./components/source";
import axios from "axios";
import BiasDialog from "./components/bias";
import { Spinner } from "@/components/ui/spinner";



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
type Message = {
  text: string;
  sender: "user" | "assistant";
};
export default function ArticleDetail() {
  const { id } = useParams();
  const [scrolled, setScrolled] = useState(false);
  const [article, setArticle] = useState({ title: '', content: '', last_updated:'', category: 'All' });
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [latestSources, setLatestSources] = useState<{ source: string; url: string }[]>([]);
  const [sources, setSources] = useState<{ source: string; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
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
  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrolled(window.scrollY > 50);
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setContentLoaded(false);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${id}`);
        const data = await res.json();
        setArticle(data);
        setContentLoaded(true);
      } catch (err) {
        console.error("Failed to fetch article:", err);
      }
    }
    if (id) fetchArticle();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchSources = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allSources/${id}`);
        setSources(res.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch sources");
        setSources([]);
      } finally {
      }
    };

    fetchSources();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchLatestSources = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/latestSources/${id}`);
        setLatestSources(res.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch latest sources");
        setLatestSources([]);
      } finally {
      }
    };

    fetchLatestSources();
  }, [id]);
  
  

  

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      
      setQuestion("");
      setConversation((prev) => [
        ...prev,
        { text: question, sender: "user" },
      ]);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, question, conversation }),
      });

      const data = await response.json();
      setLoading(false);
      if (data.error) {
        setConversation((prev) => [...prev, { text: data.error, sender: "assistant" }]);
        return;
      }
      
      setConversation((prev) => [
        ...prev,
        { text: data.message, sender: "assistant" },
      ]);

      
      // window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth'});

    } catch (error) {
      console.error("Error calling /ask:", error);
    }
  };
  useEffect(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth'});
  },[loading]);
  console.log("conversation", conversation);
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
      {
        contentLoaded ? (
          <article className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">{article.title}</h2>
            <p className="text-sm text-gray-500">
              Last updated: {getDate(article.last_updated)} at {getTime(article.last_updated)}
            </p>
            <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: article.content }} />
          </article>
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <Spinner/>
          </div>
        )
      }

      {/* Sources */}
      {
        contentLoaded && (
        <div className="flex justify-end items-center gap-2">
          <BiasDialog />
          <SourcesDialog latestArticles={latestSources} allArticles={sources}/>
        </div>)
      }
      
      {/* Conversation */}
      {conversation.length !== 0 && (<Separator className="my-6" />)}
      <section className="mb-28 space-y-4">
      {conversation.length !== 0 && conversation.map((msg, index) => (
        <div key={index} className={classNames(
          "px-4 py-2 rounded-lg w-fit max-w-[80%]",
          msg.sender === "user" ? "bg-gray-100 self-end ml-auto" : "border self-start mr-auto"
        )}> 
          <p className="text-sm text-gray-900">{msg.text}</p>
        </div>
      ))}

      {loading && (
        <div className="self-start mr-auto px-4 py-3 border rounded-lg w-fit max-w-[80%] flex items-center gap-1">
          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
        </div>
      )}
      </section>

      <section className="fixed bottom-2 left-0 right-0 bg-white border rounded-lg px-4 py-2 flex items-center gap-2 max-w-3xl mx-auto">
        <Textarea
          placeholder="Ask..."
          rows={1}
          className="flex-1 shadow-none max-h-[100px] resize-none border-0 focus:ring-0 focus-visible:ring-0"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              handleAsk();
            }
          }}
        />
        <Button variant="ghost" size="icon" className="cursor-pointer text-gray-600 hover:text-black" onClick={() => {window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth'}); handleAsk();}}>
          <Send className="h-5 w-5" />
        </Button>
      </section>
    </main>
  );
}
