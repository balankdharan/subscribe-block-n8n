const express = require("express");
const router = express.Router();
const {
  createCard,
  getTodayCard,
  markCardViewed,
  getHistory,
} = require("../controllers/cardController");
const { cardValidator } = require("../validators/cardValidator");
const { protect } = require("../middleware/auth");

router.post("/", protect, cardValidator, createCard);
router.get("/history", protect, getHistory);
router.get("/today/:blockId", protect, getTodayCard);
router.post("/:cardId/view", protect, markCardViewed);

module.exports = router;
