import { GoogleGenAI } from "@google/genai";
import express from "express";
import connectToDB from "../db.js"; // Note: Ensure `db.js` also uses ESM
import axios from "axios";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const COLLECTION_NAME = "aggregatedArticles";
const PARSED_ARTICLES_COLLECTION_NAME = "parsedArticles";
const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });

const projectFields = {
  projection: { _id: 1, id: 1, category: 1, content: 1, title: 1, last_updated: 1 },
};

const getNewsCollection = async () => {
  const db = await connectToDB();
  return db.collection(COLLECTION_NAME);
};

const getParsedArticlesCollection = async () => {
  const db = await connectToDB();
  return db.collection(PARSED_ARTICLES_COLLECTION_NAME);
};

async function getLatestConstituentArticlesBySource(clusteredArticleIdString) {
  if (!clusteredArticleIdString) {
    throw new Error("Article ID is required");
  }

  try {
    const clusteredArticleOid = new ObjectId(clusteredArticleIdString);
    const aggregatedCol = await getNewsCollection();
    const parsedCol = await getParsedArticlesCollection();

    const clusteredArticle = await aggregatedCol.findOne({ "_id": clusteredArticleOid });

    if (!clusteredArticle) {
      const error = new Error(`Clustered article with ID ${clusteredArticleIdString} not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (!clusteredArticle.constituent_article_ids || clusteredArticle.constituent_article_ids.length === 0) {
      const error = new Error(`Clustered article with ID ${clusteredArticleIdString} has no constituent_article_ids.`);
      error.statusCode = 404;
      throw error;
    }

    const constituentIds = clusteredArticle.constituent_article_ids.map(idStr => {
      try {
        return new ObjectId(idStr);
      } catch (e) {
        console.warn(`Invalid ObjectId string in constituent_article_ids: ${idStr}`);
        return null;
      }
    }).filter(id => id !== null);

    if (constituentIds.length === 0) {
      const error = new Error("No valid constituent article IDs found after processing.");
      error.statusCode = 404;
      throw error;
    }

    const latestArticlesBySource = await parsedCol.aggregate([
      { $match: { "_id": { $in: constituentIds } } },
      { $sort: { "source": 1, "published_at": -1 } },
      { $group: { _id: "$source", latestArticle: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$latestArticle" } },
      { $sort: { "source": 1 } }
    ]).toArray();

    if (latestArticlesBySource.length > 0) {
      return latestArticlesBySource;
    } else {
      const error = new Error("No constituent articles found matching the criteria or an issue occurred during aggregation.");
      error.statusCode = 404;
      throw error;
    }

  } catch (error) {
    if (error.message?.includes("Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer")) {
      const newError = new Error(`Invalid ID format for main article: ${clusteredArticleIdString}`);
      newError.statusCode = 400;
      throw newError;
    }
    console.error("Error in getLatestConstituentArticlesBySource:", error.message);
    throw error;
  }
}


async function getSourcesFromClusterId(clusterId){
  if (!clusterId) {
    throw new Error("Cluster ID is required");
  }

  try {
    const aggregatedArticles = await getNewsCollection();
    const parsedArticles = await getParsedArticlesCollection();
    const cluster = await aggregatedArticles.findOne({ _id: new ObjectId(clusterId) });
    if (!cluster) {
      throw new Error(`Cluster with ID ${clusterId} not found`);
    }
    if (!cluster.constituent_article_ids || cluster.constituent_article_ids.length === 0) {
      throw new Error(`Cluster with ID ${clusterId} has no constituent_article_ids`);
    }
    const constituentIds = cluster.constituent_article_ids.map(idStr => {
      try {
        return new ObjectId(idStr);
      } catch (e) {
        console.warn(`Invalid ObjectId string in constituent_article_ids: ${idStr}`);
        return null;
      }
    }).filter(id => id !== null);

    if (constituentIds.length === 0) {
      throw new Error("No valid constituent article IDs found after processing");
    }
    // Fetch all articles in parallel
    const articlePromises = constituentIds.map(id => 
      parsedArticles.findOne({ _id: id }, { projection: { source: 1, url: 1, _id: 0 } }) // Added _id: 0 to exclude it if not needed
    );
    const articles = await Promise.all(articlePromises);
    return articles.filter(article => article !== null); // Filter out any nulls if findOne didn't find an article
  } catch (error) {
    console.error("Error in getSourcesFromClusterId:", error.message);
    throw error;
  }
}

router.get("/allSources/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Missing 'id' parameter" });
  }

  try {
    const sources = await getSourcesFromClusterId(id);

    console.log(sources);

    if (!sources || sources.length === 0) {
      return res.status(404).json({ error: "No articles found" });
    }

    const sourceUrlPairs = sources
      .filter(article => article.source && article.url)
      .map(article => ({
        source: article.source,
        url: article.url
      }));
    console.log(sourceUrlPairs);

    return res.status(200).json(sourceUrlPairs);
  } catch (error) {
    console.error("Error in /sources route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/latestSources/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Missing 'id' parameter" });
  }

  try {
    const latestArticles = await getLatestConstituentArticlesBySource(id);

    if (!latestArticles || latestArticles.length === 0) {
      return res.status(404).json({ error: "No articles found" });
    }

    const sourceUrlPairs = latestArticles
      .filter(article => article.source && article.url)
      .map(article => ({
        source: article.source,
        url: article.url
      }));
    
      console.log(res.json(sourceUrlPairs));
    return res.status(200).json(sourceUrlPairs);
  } catch (error) {
    console.error("Error in /sources route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/all", async (req, res) => {
  const col = await getNewsCollection();
  const results = await col.find({}, projectFields).toArray();
  res.json(results);
});

const categories = ["technology", "politics", "sports", "entertainment", "business"];
categories.forEach(category => {
  router.get(`/${category}`, async (req, res) => {
    const col = await getNewsCollection();
    const results = await col.find({ category: { $regex: `^${category}$`, $options: 'i' } }, projectFields).toArray();
    res.json(results);
  });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const col = await getNewsCollection();

  try {
    const objectId = new ObjectId(id);
    const item = await col.findOne({ _id: objectId }, projectFields);

    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
});

router.get("/latest-sources", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Missing 'id' parameter" });
  }

  try {
    const latestArticles = await getLatestConstituentArticlesBySource(id);

    if (!latestArticles || latestArticles.length === 0) {
      return res.status(404).json({ error: "No articles found" });
    }

    const sourceUrlPairs = latestArticles
      .filter(article => article.source && article.url)
      .map(article => ({
        source: article.source,
        url: article.url
      }));
    
      console.log(res.json(sourceUrlPairs));
    return res.status(200).json(sourceUrlPairs);
  } catch (error) {
    console.error("Error in /sources route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



router.post("/ask", async (req, res) => {
  const { id, question, conversation } = req.body;

  if (!id || !question || !Array.isArray(conversation)) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  try {
    const latestArticles = await getLatestConstituentArticlesBySource(id);
    if (!latestArticles || latestArticles.length === 0) {
      return res.status(404).json({ error: "No latest articles found" });
    }

    const articleSummaries = latestArticles.map(article => (
      `Title: ${article.title}\nSource: ${article.source}\nURL: ${article.url}`
    )).join("\n\n");

    const contextText = `
    You are an AI assistant. Based on the provided news context, conversation history, and latest articles, answer the user's question.

    Respond ONLY the answer.
    Donot use **markdown**.
    Instead of **markdown** use plain text.
    Donot answer any question that lies beyond the conversation history and latest articles.
    Donot use any other information to answer the question.
    
    Conversation History:
    ${conversation.join("\n")}

    Latest Articles:
    ${articleSummaries}

    Question: ${question}
    `;

    const response = await ai.models.generateContent({
      model: "gemma-3-27b-it",
      contents: [{ role: "user", parts: [{ text: contextText }] }],
    });

    if (!response ) {
      console.log(response);
      return res.status(500).json({ error: "No response generated." });
    } else {
      return res.status(200).json({message: response.candidates[0].content.parts[0].text });
    }
  } catch (error) {
    console.error("Error in /ask route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
