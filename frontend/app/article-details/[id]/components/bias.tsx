'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from 'next/image';

const article_analysis = [
  {
    source_name: "India Today",
    is_relevant: true,
    relevance_reason: null,
    identified_biases: []
  },
  {
    source_name: "India Today",
    is_relevant: true,
    relevance_reason: null,
    identified_biases: []
  },
  {
    source_name: "India Today",
    is_relevant: true,
    relevance_reason: null,
    identified_biases: []
  },
  {
    source_name: "India Today",
    is_relevant: true,
    relevance_reason: null,
    identified_biases: [
      {
        bias_type: "Framing",
        explanation: "The article frames Rana's punishment as a matter of justice for the victims.",
        evidence: "“The terrorists should be hanged publicly. The punishment should be a …”"
      }
    ]
  },
  {
    source_name: "India Today",
    is_relevant: true,
    relevance_reason: null,
    identified_biases: [
      {
        bias_type: "Framing",
        explanation: "The article frames Rana's punishment as a matter of justice for the victims.",
        evidence: "“The terrorists should be hanged publicly. The punishment should be a …”"
      }
    ]
  },
  {
    source_name: "India Today",
    is_relevant: true,
    relevance_reason: null,
    identified_biases: [
      {
        bias_type: "Framing",
        explanation: "The article frames Rana's punishment as a matter of justice for the victims.",
        evidence: "“The terrorists should be hanged publicly. The punishment should be a …”"
      },
      {
        bias_type: "Framing",
        explanation: "The article frames Rana's punishment as a matter of justice for the victims.",
        evidence: "“The terrorists should be hanged publicly. The punishment should be a …”"
      },
      {
        bias_type: "Framing",
        explanation: "The article frames Rana's punishment as a matter of justice for the victims.",
        evidence: "“The terrorists should be hanged publicly. The punishment should be a …”"
      }
    ]
  }
]

function HeadingComponent({ source }: { source: string }) {
    const imagePath = `/source-logos/${source}.png` // Ensure this path is valid and image exists
    return (
      <div className="flex items-center gap-2">
        <Image
          src={imagePath}
          alt={source}
          width={30}
          height={30}
          className="rounded-sm"
        />
        <span className="font-semibold">{source}</span>
      </div>
    )
  }

export default function BiasDialog() {
    
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Show Bias Analysis</Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Article Bias Analysis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {article_analysis
            .filter(article => article.identified_biases.length > 0)
            .map((article, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <HeadingComponent source={article.source_name} />
                  </div>
                  <ul className="space-y-2 pl-4 border-l border-gray-300">
                    {article.identified_biases.map((bias, bIdx) => (
                      <>
                      <li key={bIdx} className="text-sm">
                        <p><span className="font-medium">Type:</span> {bias.bias_type}</p>
                        <p><span className="font-medium">Explanation:</span> {bias.explanation}</p>
                        <p><span className="font-medium">Evidence:</span> {bias.evidence}</p>
                      </li>
                      <Separator className="my-2" />
                      </>
                    ))}
                  </ul>
                </CardContent>
              </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
