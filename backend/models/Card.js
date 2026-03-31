const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    tags: [{ type: String }],
    sourceType: {
      type: String,
      enum: ["ai", "user"],
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

cardSchema.index({ blockId: 1, scheduledDate: 1 }, { unique: true });
cardSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model("Card", cardSchema);
