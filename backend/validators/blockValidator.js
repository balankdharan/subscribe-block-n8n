const { body } = require("express-validator");

const blockValidator = [
  body("name").trim().notEmpty().withMessage("Block name is required"),
  body("type")
    .isIn(["open_card", "flashcard"])
    .withMessage("Type must be open_card or flashcard"),
  body("visibility")
    .isIn(["public", "private"])
    .withMessage("Visibility must be public or private"),
  body("userDescription")
    .trim()
    .notEmpty()
    .withMessage(
      "userDescription is required — describe what this block should generate",
    ),
];

module.exports = { blockValidator };
