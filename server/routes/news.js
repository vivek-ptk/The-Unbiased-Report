const express = require("express");
const router = express.Router();
const connectToDB = require("../db");
const axios = require("axios");
const { ObjectId } = require("mongodb");

const COLLECTION_NAME = "aggregatedArticles";
const PARSED_ARTICLES_COLLECTION_NAME = "parsedArticles";

// Helper to project required fields
const projectFields = {
  projection: { _id: 1, id: 1, category: 1, content: 1, title: 1, last_updated:1},
};

const getNewsCollection = async () => {
  const db = await connectToDB();
  return db.collection(COLLECTION_NAME);
};

const getParsedArticlesCollection = async () => {
  const db = await connectToDB();
  return db.collection(PARSED_ARTICLES_COLLECTION_NAME);
};

// Method to get latest constituent articles by source
async function getLatestConstituentArticlesBySource(clusteredArticleIdString) {
  if (!clusteredArticleIdString) {
    throw new Error("Article ID is required");
  }

  try {
    const clusteredArticleOid = new ObjectId(clusteredArticleIdString);
    const aggregatedCol = await getNewsCollection();
    const parsedCol = await getParsedArticlesCollection();

    // 1. Find the clustered article
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

    // 2. Query constituent articles and select the latest from each source
    const latestArticlesBySource = await parsedCol.aggregate([
      {
        $match: {
          "_id": { $in: constituentIds }
        }
      },
      {
        $sort: {
          "source": 1,
          "published_at": -1
        }
      },
      {
        $group: {
          _id: "$source",
          latestArticle: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$latestArticle" }
      },
      {
        $sort: { "source": 1 }
      }
    ]).toArray();

    if (latestArticlesBySource.length > 0) {
      return latestArticlesBySource;
    } else {
      const error = new Error("No constituent articles found matching the criteria or an issue occurred during aggregation.");
      error.statusCode = 404;
      throw error;
    }

  } catch (error) {
    if (error.message && error.message.includes("Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer")) {
      const newError = new Error(`Invalid ID format for main article: ${clusteredArticleIdString}`);
      newError.statusCode = 400;
      throw newError;
    }
    // Re-throw other errors, potentially adding more context or logging
    console.error("Error in getLatestConstituentArticlesBySource:", error.message);
    throw error; // Rethrow the original or a new error
  }
}

router.get("/all", async (req, res) => {
  const col = await getNewsCollection();
  const results = await col.find({}, projectFields).toArray();
  res.json(results);
});

const categories = ["technology", "politics", "sports", "entertainment", "business"];

categories.forEach((category) => {
  router.get(`/${category}`, async (req, res) => {
    const col = await getNewsCollection();
    const results = await col.find(
      { category: { $regex: `^${category}$`, $options: 'i' } }, // case-insensitive exact match
      projectFields
    ).toArray();
    res.json(results);
  });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const col = await getNewsCollection();

  try {
    const objectId = new ObjectId(id); // convert string to ObjectId
    const item = await col.findOne({ _id: objectId }, projectFields);

    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
});

// router.get("/latest/:id", async (req, res) => {
//   const { id } = req.params;

//   if (!id) {
//     return res.status(400).json({ error: "ID is required" });
//   }

//   try {
//     const latestArticles = await getLatestConstituentArticlesBySource(id);
//     retObj = latestArticles.map(article => ({
//       title: article.title,
//       source: article.source,
//       published_date: article.published_at,
//     }));
//     res.json(retObj);
//   } catch (error) {
//     console.error("Error fetching latest articles:", error);
//     res.status(error.statusCode || 500).json({ error: error.message });
//   }
// });

router.post("/ask", async (req, res) => {
  const { id, question, conversation } = req.body;

  if (!id || !question || !Array.isArray(conversation)) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  const col = await getNewsCollection();
  const newsItem = await col.findOne({ id }, { projection: { _id: 0, context: 1 } });
  
  latestArticles = await getLatestConstituentArticlesBySource(id);
  print(latestArticles);

  if (!newsItem) return res.status(404).json({ error: "News context not found" });

  // Mock ML backend call
  try {
    const mlResponse = await axios.post("http://ml-backend.local/api", {
      question,
      context: newsItem.context,
      conversation,
    });

    res.json({ id, answer: mlResponse.data.answer });
  } catch (error) {
    res.status(500).json({ error: "ML backend error", details: error.message });
  }
});

module.exports = router;
// To use the new method, you might export it as well:
// module.exports = { router, getLatestConstituentArticlesBySource };
// Or, if this file is only for routes, you might move getLatestConstituentArticlesBySource
// to a different utility/service file and import it where needed.
