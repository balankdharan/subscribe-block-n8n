const mongoose = require("mongoose");

const promptTemplateSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    languages: [{ type: String }],
    format: { type: String },
    systemPrompt: { type: String, required: true },
    outputSchema: { type: mongoose.Schema.Types.Mixed, default: {} },
    userDescription: { type: String, default: null },
  },
  { _id: false },
);

const blockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    type: {
      type: String,
      enum: ["open_card", "flashcard"],
      default: "open_card",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceType: {
      type: String,
      enum: ["ai", "user"],
      required: true,
    },
    promptTemplate: {
      type: promptTemplateSchema,
      required: true,
    },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

blockSchema.index({ visibility: 1 });
blockSchema.index({ createdBy: 1 });
blockSchema.index({ tags: 1 });

module.exports = mongoose.model("Block", blockSchema);
