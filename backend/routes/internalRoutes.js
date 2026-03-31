const express = require("express");
const router = express.Router();
const Block = require("../models/Block");
const Card = require("../models/Card");
const { internalKey } = require("../middleware/internalKey");
const { generateCard } = require("../config/groq");

// GET /api/internal/blocks/active
// Returns all blocks that have no card scheduled for tomorrow
router.get("/blocks/active", internalKey, async (req, res, next) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const allBlocks = await Block.find({ sourceType: "ai" });

    const blocksNeedingCard = await Promise.all(
      allBlocks.map(async (block) => {
        const exists = await Card.findOne({
          blockId: block._id,
          scheduledDate: { $gte: tomorrow, $lt: dayAfter },
        });
        return exists ? null : block;
      }),
    );

    res.json(blocksNeedingCard.filter(Boolean));
  } catch (err) {
    next(err);
  }
});

// GET /api/internal/cards/recent/:blockId
// Returns last N original texts for a block (for LLM history context)
router.get("/cards/recent/:blockId", internalKey, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const cards = await Card.find({ blockId: req.params.blockId })
      .sort({ scheduledDate: -1 })
      .limit(limit)
      .select("content -_id");

    res.json(cards.map((c) => JSON.stringify(c.content)));
  } catch (err) {
    next(err);
  }
});

// POST /api/internal/cards/generate
// Called by n8n to generate and save tomorrow's card for a block
router.post("/cards/generate", internalKey, async (req, res, next) => {
  try {
    const { blockId } = req.body;
    if (!blockId)
      return res.status(400).json({ message: "blockId is required" });

    const block = await Block.findById(blockId);
    if (!block) return res.status(404).json({ message: "Block not found" });

    // Fetch recent originals for deduplication context
    const recentCards = await Card.find({ blockId })
      .sort({ scheduledDate: -1 })
      .limit(30)
      .select("content -_id");
    const recentOriginals = recentCards.map((c) => JSON.stringify(c.content));

    // Generate card via Groq
    const cardData = await generateCard(block.promptTemplate, recentOriginals);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const card = await Card.create({
      blockId: block._id,
      content: cardData,
      tags: cardData.tags || [],
      sourceType: "ai",
      scheduledDate: tomorrow,
    });

    res.status(201).json(card);
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(409)
        .json({ message: "Card already exists for tomorrow" });
    next(err);
  }
});

module.exports = router;
