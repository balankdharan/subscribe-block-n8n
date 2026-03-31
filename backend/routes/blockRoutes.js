const express = require("express");
const router = express.Router();
const {
  createBlock,
  getPublicBlocks,
  getMyBlocks,
  getBlockById,
  updateBlock,
  deleteBlock,
  subscribeToBlock,
  unsubscribeFromBlock,
} = require("../controllers/blockController");
const { blockValidator } = require("../validators/blockValidator");
const { protect } = require("../middleware/auth");

router.get("/", getPublicBlocks);
router.get("/mine", protect, getMyBlocks);
router.get("/:id", protect, getBlockById);
router.post("/", protect, blockValidator, createBlock);
router.patch("/:id", protect, updateBlock);
router.delete("/:id", protect, deleteBlock);
router.post("/:id/subscribe", protect, subscribeToBlock);
router.delete("/:id/subscribe", protect, unsubscribeFromBlock);

module.exports = router;
