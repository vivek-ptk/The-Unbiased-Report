'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import React from "react";
import { Scale } from "lucide-react";

type Bias = {
  bias_type: string;
  explanation: string;
  evidence: string;
};

type ArticleAnalysis = {
  source_name: string;
  is_relevant: boolean;
  relevance_reason: string | null;
  identified_biases: Bias[];
};

function HeadingComponent({ source }: { source: string }) {
  const imagePath = `/source-logos/${source}.png`; // Ensure these images exist or use a fallback

  return (
    <div className="flex items-center gap-2">
      <Image
        src={imagePath}
        alt={source}
        width={30}
        height={30}
        className="rounded-sm"
        onError={(e) => {
          // Optional fallback
          (e.target as HTMLImageElement).src = "/source-logos/default.png";
        }}
      />
      <span className="font-semibold">{source}</span>
    </div>
  );
}

export default function BiasDialog() {
  const params = useParams();
  const id = params?.id as string;
  const [biasAnalysis, setBiasAnalysis] = useState<ArticleAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBiasAnalysis = async () => {
      if (!id) return;
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getBiasAnalysis/${id}`);
        console.log("response " ,response);
        console.log(response.data);
        setBiasAnalysis(response.data);
      } catch (err: any) {
        console.error("Error fetching bias analysis:", err);
        setError(err.response?.data?.error || "Error fetching data");
      }
    };
    console.log("id in useffect", id);
    fetchBiasAnalysis();
  }, [id]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="cursor-pointer"><span>Bias Analysis</span><Scale /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Article Bias Analysis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {biasAnalysis.length !== 0 &&
            biasAnalysis
              .filter((article) => article.identified_biases.length > 0)
              .map((article, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <HeadingComponent source={article.source_name} />
                    </div>
                    <ul className="space-y-2 pl-4 border-l border-gray-300">
                      {article.identified_biases.map((bias, bIdx) => (
                        <React.Fragment key={bIdx}>
                          <li className="text-sm">
                            <p><span className="font-medium">Type:</span> {bias.bias_type}</p>
                            <p><span className="font-medium">Explanation:</span> {bias.explanation}</p>
                            <p><span className="font-medium">Evidence:</span> {bias.evidence}</p>
                          </li>
                          <Separator className="my-2" />
                        </React.Fragment>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
        {biasAnalysis.filter((article) => article.identified_biases.length > 0).length === 0 && (
          <div className="text-center text-gray-500">
            No bias detected.
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
