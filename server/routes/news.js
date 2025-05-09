const express = require("express");
const router = express.Router();
const connectToDB = require("../db");
const axios = require("axios");
const { ObjectId } = require("mongodb");

const COLLECTION_NAME = "News";

// Helper to project required fields
const projectFields = {
  projection: { _id: 1, id: 1, category: 1, summary: 1, title: 1, date: 1, time: 1, location: 1 },
};

const getNewsCollection = async () => {
  const db = await connectToDB();
  return db.collection(COLLECTION_NAME);
};

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

router.post("/ask", async (req, res) => {
  const { id, question, conversation } = req.body;

  if (!id || !question || !Array.isArray(conversation)) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  const col = await getNewsCollection();
  const newsItem = await col.findOne({ id }, { projection: { _id: 0, context: 1 } });

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
