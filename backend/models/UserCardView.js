const mongoose = require("mongoose");

const userCardViewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
      required: true,
    },
    viewedDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

userCardViewSchema.index({ userId: 1, cardId: 1 }, { unique: true });
userCardViewSchema.index({ userId: 1, blockId: 1 });
userCardViewSchema.index({ userId: 1, viewedDate: -1 });

module.exports = mongoose.model("UserCardView", userCardViewSchema);
