const express = require("express");
const router = express.Router();
const connectToDB = require("../db");
const axios = require("axios");

const COLLECTION_NAME = "News";

// Helper to project required fields
const projectFields = {
  projection: { _id: 0, id: 1, label: 1, summary: 1, title: 1, date: 1, time: 1, location: 1 },
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

const labels = ["technology", "politics", "sports", "entertainment", "business"];

labels.forEach((label) => {
  router.get(`/${label}`, async (req, res) => {
    const col = await getNewsCollection();
    const results = await col.find({ label }, projectFields).toArray();
    res.json(results);
  });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const col = await getNewsCollection();
  const item = await col.findOne({ id }, projectFields);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
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
