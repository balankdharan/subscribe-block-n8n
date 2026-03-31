const { validationResult } = require("express-validator");
const Card = require("../models/Card");
const UserCardView = require("../models/UserCardView");

exports.createCard = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const card = await Card.create(req.body);
    res.status(201).json(card);
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(409)
        .json({ message: "A card already exists for this block on that date" });
    next(err);
  }
};

exports.getTodayCard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const card = await Card.findOne({
      blockId: req.params.blockId,
      scheduledDate: { $gte: today, $lt: tomorrow },
    });

    if (!card)
      return res.status(404).json({ message: "No card scheduled for today" });

    res.json(card);
  } catch (err) {
    next(err);
  }
};

exports.markCardViewed = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await UserCardView.findOneAndUpdate(
      { userId: req.user.id, cardId: card._id },
      {
        userId: req.user.id,
        cardId: card._id,
        blockId: card.blockId,
        viewedDate: today,
      },
      { upsert: true, new: true },
    );

    res.json({ message: "Card marked as viewed" });
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { blockId, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user.id };
    if (blockId) filter.blockId = blockId;

    const views = await UserCardView.find(filter)
      .populate("cardId")
      .populate("blockId", "name type")
      .sort({ viewedDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(views);
  } catch (err) {
    next(err);
  }
};
