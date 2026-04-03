const { validationResult } = require("express-validator");
const Block = require("../models/Block");
const Card = require("../models/Card");
const User = require("../models/User");
const { generatePromptTemplate, generateCard } = require("../config/groq");

const createBlock = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, description, type, visibility, userDescription, tags } =
      req.body;

    // Step 1 — AI generates the prompt template from user's description
    let promptTemplate;
    try {
      promptTemplate = await generatePromptTemplate(userDescription);
      promptTemplate.userDescription = userDescription;
    } catch (err) {
      return res.status(502).json({
        message: "Failed to generate prompt template from description",
        detail: err.message,
      });
    }

    // Step 2 — Save the block
    const block = await Block.create({
      name,
      description,
      type: type || "open_card",
      visibility: visibility || "public",
      sourceType: "ai",
      createdBy: req.user.id,
      promptTemplate,
      tags: tags || [],
    });

    // Step 3 — Generate a sample card immediately for preview
    let sampleCard = null;
    try {
      const cardData = await generateCard(promptTemplate, []);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      sampleCard = await Card.create({
        blockId: block._id,
        content: cardData,
        tags: cardData.tags || [],
        sourceType: "ai",
        scheduledDate: today,
      });
    } catch (err) {
      // Sample card failure should not block the response
      console.error("Sample card generation failed:", err.message);
    }

    res.status(201).json({ block, sampleCard });
  } catch (err) {
    next(err);
  }
};

const getPublicBlocks = async (req, res, next) => {
  try {
    const { tags, page = 1, limit = 20 } = req.query;
    const filter = { visibility: "public" };
    if (tags) filter.tags = { $in: tags.split(",") };

    const blocks = await Block.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(blocks);
  } catch (err) {
    next(err);
  }
};

const getMyBlocks = async (req, res, next) => {
  try {
    const blocks = await Block.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(blocks);
  } catch (err) {
    next(err);
  }
};

const getBlockById = async (req, res, next) => {
  try {
    const block = await Block.findById(req.params.id).populate(
      "createdBy",
      "name",
    );
    if (!block) return res.status(404).json({ message: "Block not found" });

    const isOwner = block.createdBy._id.toString() === req.user.id;
    if (block.visibility === "private" && !isOwner)
      return res.status(403).json({ message: "Access denied" });

    res.json(block);
  } catch (err) {
    next(err);
  }
};

const updateBlock = async (req, res, next) => {
  try {
    const block = await Block.findById(req.params.id);
    if (!block) return res.status(404).json({ message: "Block not found" });
    if (block.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Block.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const deleteBlock = async (req, res, next) => {
  try {
    const block = await Block.findById(req.params.id);
    if (!block) return res.status(404).json({ message: "Block not found" });
    if (block.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await block.deleteOne();
    res.json({ message: "Block deleted" });
  } catch (err) {
    next(err);
  }
};

const subscribeToBlock = async (req, res, next) => {
  try {
    const block = await Block.findById(req.params.id);
    if (!block) return res.status(404).json({ message: "Block not found" });
    if (
      block.visibility === "private" &&
      block.createdBy.toString() !== req.user.id
    )
      return res.status(403).json({ message: "Access denied" });

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { subscribedBlocks: block._id },
    });
    res.json({ message: "Subscribed to block" });
  } catch (err) {
    next(err);
  }
};

const unsubscribeFromBlock = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { subscribedBlocks: req.params.id },
    });
    res.json({ message: "Unsubscribed from block" });
  } catch (err) {
    next(err);
  }
};

const getSubscribedBlocks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("subscribedBlocks");
    res.json(user.subscribedBlocks);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBlock,
  getPublicBlocks,
  getMyBlocks,
  getSubscribedBlocks,
  getBlockById,
  updateBlock,
  deleteBlock,
  subscribeToBlock,
  unsubscribeFromBlock,
};
